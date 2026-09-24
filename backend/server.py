from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import random
import httpx
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


# ----------------------------- Helpers -----------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:16]}"


# ----------------------------- Models -----------------------------
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: str
    onboarding_completed: bool = False
    onboarding_prefs: Dict[str, Any] = Field(default_factory=dict)
    mode: str = "simple"           # 'simple' | 'pro'
    theme: str = "dark"            # 'dark' | 'light' | 'system'


class PrefsUpdate(BaseModel):
    mode: Optional[str] = None
    theme: Optional[str] = None
    sidebar_collapsed: Optional[bool] = None


class OnboardingPayload(BaseModel):
    goals: List[str] = Field(default_factory=list)
    work_style: str = "no_code"    # no_code | code_sometimes | developer
    connected: Dict[str, bool] = Field(default_factory=dict)
    mode: str = "simple"


class ProjectCreate(BaseModel):
    name: Optional[str] = None
    description: str = ""
    type: str = "web"              # web | agent | fullstack | mobile
    framework: str = "Auto"
    mode: str = "simple"
    prompt: str = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    mode: Optional[str] = None
    archived: Optional[bool] = None


class Project(BaseModel):
    id: str
    user_id: str
    name: str
    description: str = ""
    type: str = "web"
    framework: str = "Auto"
    status: str = "draft"          # draft | building | live | failed
    mode: str = "simple"
    prompt: str = ""
    accent: str = "emerald"
    is_sample: bool = False
    archived: bool = False
    created_at: str
    updated_at: str
    last_edited: str


# ----------------------------- Auth -----------------------------
async def get_current_user(request: Request) -> User:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)


@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        body = {}
        try:
            body = await request.json()
        except Exception:
            body = {}
        session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session id")

    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Could not verify session")
    data = r.json()

    email = data["email"]
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user = User(**existing)
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {"name": data.get("name", user.name), "picture": data.get("picture")}},
        )
    else:
        user = User(
            user_id=new_id("user_"),
            email=email,
            name=data.get("name", email.split("@")[0]),
            picture=data.get("picture"),
            created_at=now_iso(),
        )
        await db.users.insert_one(user.model_dump())

    session_token = data["session_token"]
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "user_id": user.user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": now_iso(),
        }},
        upsert=True,
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )
    fresh = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return User(**fresh)


@api_router.get("/auth/me", response_model=User)
async def auth_me(user: User = Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ----------------------------- User prefs -----------------------------
@api_router.patch("/users/me", response_model=User)
async def update_prefs(payload: PrefsUpdate, user: User = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"user_id": user.user_id}, {"$set": update})
    fresh = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return User(**fresh)


@api_router.post("/users/me/onboarding", response_model=User)
async def complete_onboarding(payload: OnboardingPayload, user: User = Depends(get_current_user)):
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "onboarding_completed": True,
            "onboarding_prefs": {"goals": payload.goals, "work_style": payload.work_style, "connected": payload.connected},
            "mode": payload.mode,
        }},
    )
    fresh = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return User(**fresh)


# ----------------------------- Projects -----------------------------
ACCENTS = ["emerald", "blue", "amber", "rose", "violet", "cyan"]


def _default_name(prompt: str, ptype: str) -> str:
    if prompt:
        words = prompt.strip().split()
        title = " ".join(words[:5])
        return title[:40].strip().capitalize() or "Untitled project"
    return {"web": "Web app", "agent": "AI agent", "fullstack": "Full-stack app", "mobile": "Mobile web app"}.get(ptype, "New project")


@api_router.get("/projects", response_model=List[Project])
async def list_projects(status: Optional[str] = None, include_archived: bool = False, user: User = Depends(get_current_user)):
    q: Dict[str, Any] = {"user_id": user.user_id}
    if not include_archived:
        q["archived"] = False
    if status:
        q["status"] = status
    docs = await db.projects.find(q, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return [Project(**d) for d in docs]


@api_router.post("/projects", response_model=Project)
async def create_project(payload: ProjectCreate, user: User = Depends(get_current_user)):
    ts = now_iso()
    proj = Project(
        id=new_id("proj_"),
        user_id=user.user_id,
        name=payload.name or _default_name(payload.prompt, payload.type),
        description=payload.description or (payload.prompt[:120] if payload.prompt else ""),
        type=payload.type,
        framework=payload.framework,
        status="draft",
        mode=payload.mode or user.mode,
        prompt=payload.prompt,
        accent=random.choice(ACCENTS),
        created_at=ts,
        updated_at=ts,
        last_edited=ts,
    )
    await db.projects.insert_one(proj.model_dump())
    return proj


@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, user: User = Depends(get_current_user)):
    doc = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**doc)


@api_router.patch("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, payload: ProjectUpdate, user: User = Depends(get_current_user)):
    doc = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    update["last_edited"] = now_iso()
    await db.projects.update_one({"id": project_id}, {"$set": update})
    fresh = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return Project(**fresh)


@api_router.post("/projects/{project_id}/duplicate", response_model=Project)
async def duplicate_project(project_id: str, user: User = Depends(get_current_user)):
    doc = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    ts = now_iso()
    doc = dict(doc)
    doc["id"] = new_id("proj_")
    doc["name"] = f"{doc['name']} copy"
    doc["status"] = "draft"
    doc["is_sample"] = False
    doc["archived"] = False
    doc["created_at"] = ts
    doc["updated_at"] = ts
    doc["last_edited"] = ts
    await db.projects.insert_one(doc)
    return Project(**doc)


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: User = Depends(get_current_user)):
    res = await db.projects.delete_one({"id": project_id, "user_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}


SAMPLE_PROJECTS = [
    {"name": "Northwind Analytics", "description": "SaaS dashboard with revenue charts, customers table and billing.", "type": "fullstack", "framework": "Next.js", "status": "live", "accent": "emerald", "prompt": "A SaaS analytics dashboard for tracking revenue and customers"},
    {"name": "Lumen Landing", "description": "Marketing landing page for a design tool with pricing and FAQ.", "type": "web", "framework": "React", "status": "draft", "accent": "blue", "prompt": "A modern landing page for a design tool"},
    {"name": "Helpdesk Copilot", "description": "AI support agent that answers docs questions with tool calls.", "type": "agent", "framework": "LangGraph", "status": "building", "accent": "violet", "prompt": "An AI support agent for customer help"},
    {"name": "Ledger Mobile", "description": "Personal finance tracker, mobile-first expense logging.", "type": "mobile", "framework": "React", "status": "failed", "accent": "amber", "prompt": "A mobile expense tracking app"},
]


@api_router.post("/projects/load-sample", response_model=List[Project])
async def load_sample(user: User = Depends(get_current_user)):
    await db.projects.delete_many({"user_id": user.user_id, "is_sample": True})
    created = []
    base = datetime.now(timezone.utc)
    for i, s in enumerate(SAMPLE_PROJECTS):
        ts = (base - timedelta(days=i, hours=i * 3)).isoformat()
        proj = Project(
            id=new_id("proj_"),
            user_id=user.user_id,
            is_sample=True,
            created_at=ts,
            updated_at=ts,
            last_edited=ts,
            **s,
        )
        await db.projects.insert_one(proj.model_dump())
        created.append(proj)
    return created


class Message(BaseModel):
    id: str
    project_id: str
    user_id: str
    role: str                      # user | assistant | system
    content: str = ""
    kind: str = "text"            # text | plan | build | error
    meta: Dict[str, Any] = Field(default_factory=dict)
    created_at: str


class MessageCreate(BaseModel):
    role: str
    content: str = ""
    kind: str = "text"
    meta: Dict[str, Any] = Field(default_factory=dict)


@api_router.get("/projects/{project_id}/messages", response_model=List[Message])
async def list_messages(project_id: str, user: User = Depends(get_current_user)):
    proj = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    docs = await db.messages.find({"project_id": project_id, "user_id": user.user_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return [Message(**d) for d in docs]


@api_router.post("/projects/{project_id}/messages", response_model=Message)
async def create_message(project_id: str, payload: MessageCreate, user: User = Depends(get_current_user)):
    proj = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    msg = Message(
        id=new_id("msg_"),
        project_id=project_id,
        user_id=user.user_id,
        role=payload.role,
        content=payload.content,
        kind=payload.kind,
        meta=payload.meta,
        created_at=now_iso(),
    )
    await db.messages.insert_one(msg.model_dump())
    await db.projects.update_one({"id": project_id}, {"$set": {"last_edited": now_iso(), "updated_at": now_iso()}})
    return msg


# ----------------------------- Agents -----------------------------
class Agent(BaseModel):
    id: str
    user_id: str
    name: str
    goal: str = ""
    framework: str = "LangGraph"
    model: str = "Claude Sonnet 4.6"
    status: str = "active"         # active | draft
    success_rate: int = 95
    runs: int = 0
    tools: List[str] = Field(default_factory=list)
    system_prompt: str = ""
    is_sample: bool = False
    created_at: str


class AgentCreate(BaseModel):
    name: str
    goal: str = ""
    framework: str = "LangGraph"
    model: str = "Claude Sonnet 4.6"
    tools: List[str] = Field(default_factory=list)
    system_prompt: str = ""


SAMPLE_AGENTS = [
    {"name": "Helpdesk Copilot", "goal": "Answer customer questions from our help center and draft replies.", "framework": "LangGraph", "model": "Claude Sonnet 4.6", "success_rate": 96, "runs": 1284, "tools": ["Web search", "Database", "Email"], "system_prompt": "You are a friendly support agent. Use the knowledge base before answering. Never invent policy."},
    {"name": "Research Scout", "goal": "Run multi-step web research and return a cited summary.", "framework": "CrewAI", "model": "GPT-5.4", "success_rate": 91, "runs": 512, "tools": ["Web search", "Custom API"], "system_prompt": "You research topics thoroughly and always cite sources."},
]


async def _seed_agents(user_id: str):
    created = []
    base = datetime.now(timezone.utc)
    for i, a in enumerate(SAMPLE_AGENTS):
        ag = Agent(id=new_id("agent_"), user_id=user_id, is_sample=True, created_at=(base - timedelta(days=i)).isoformat(), **a)
        await db.agents.insert_one(ag.model_dump())
        created.append(ag)
    return created


@api_router.get("/agents", response_model=List[Agent])
async def list_agents(user: User = Depends(get_current_user)):
    docs = await db.agents.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    if not docs:
        created = await _seed_agents(user.user_id)
        return created
    return [Agent(**d) for d in docs]


@api_router.post("/agents", response_model=Agent)
async def create_agent(payload: AgentCreate, user: User = Depends(get_current_user)):
    ag = Agent(
        id=new_id("agent_"),
        user_id=user.user_id,
        status="draft",
        success_rate=0,
        runs=0,
        created_at=now_iso(),
        **payload.model_dump(),
    )
    await db.agents.insert_one(ag.model_dump())
    return ag


@api_router.get("/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str, user: User = Depends(get_current_user)):
    doc = await db.agents.find_one({"id": agent_id, "user_id": user.user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Agent not found")
    return Agent(**doc)


@api_router.get("/")
async def root():
    return {"message": "Architect 2.0 API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
