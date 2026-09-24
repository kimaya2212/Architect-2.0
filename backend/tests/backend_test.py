"""Backend API tests for Architect 2.0 Phase 1."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://vibe-ship.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

TOKEN_1 = "test_session_seed_01"
TOKEN_2 = "test_session_seed_02"
TOKEN_ONBOARD = "test_session_seed_03"


def H(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def s1():
    s = requests.Session()
    s.headers.update(H(TOKEN_1))
    return s


@pytest.fixture(scope="module")
def s2():
    s = requests.Session()
    s.headers.update(H(TOKEN_2))
    return s


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    # clean user 1's projects before starting
    s = requests.Session(); s.headers.update(H(TOKEN_1))
    r = s.get(f"{API}/projects?include_archived=true")
    if r.ok:
        for p in r.json():
            s.delete(f"{API}/projects/{p['id']}")
    s2 = requests.Session(); s2.headers.update(H(TOKEN_2))
    r = s2.get(f"{API}/projects?include_archived=true")
    if r.ok:
        for p in r.json():
            s2.delete(f"{API}/projects/{p['id']}")
    yield


# ---------------- Auth ----------------
class TestAuth:
    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_bearer(self, s1):
        r = s1.get(f"{API}/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["user_id"] == "user_testseed01"
        assert data["email"] == "tester@architect.app"

    def test_me_cookie(self):
        r = requests.get(f"{API}/auth/me", cookies={"session_token": TOKEN_1})
        assert r.status_code == 200
        assert r.json()["user_id"] == "user_testseed01"

    def test_invalid_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer bad_token_xxx"})
        assert r.status_code == 401


# ---------------- Projects CRUD ----------------
class TestProjects:
    def test_create_and_list(self, s1):
        r = s1.post(f"{API}/projects", json={"prompt": "A todo app with reminders", "type": "web"})
        assert r.status_code == 200
        p = r.json()
        assert p["user_id"] == "user_testseed01"
        assert p["status"] == "draft"
        assert p["prompt"] == "A todo app with reminders"
        assert "id" in p
        pytest.proj_id = p["id"]

        # list
        r = s1.get(f"{API}/projects")
        assert r.status_code == 200
        ids = [x["id"] for x in r.json()]
        assert pytest.proj_id in ids

    def test_get_project(self, s1):
        r = s1.get(f"{API}/projects/{pytest.proj_id}")
        assert r.status_code == 200
        assert r.json()["id"] == pytest.proj_id

    def test_patch_rename(self, s1):
        r = s1.patch(f"{API}/projects/{pytest.proj_id}", json={"name": "Renamed Project"})
        assert r.status_code == 200
        assert r.json()["name"] == "Renamed Project"
        # persistence
        r = s1.get(f"{API}/projects/{pytest.proj_id}")
        assert r.json()["name"] == "Renamed Project"

    def test_patch_status(self, s1):
        r = s1.patch(f"{API}/projects/{pytest.proj_id}", json={"status": "building"})
        assert r.status_code == 200
        assert r.json()["status"] == "building"

    def test_duplicate(self, s1):
        r = s1.post(f"{API}/projects/{pytest.proj_id}/duplicate")
        assert r.status_code == 200
        d = r.json()
        assert d["name"].endswith(" copy")
        assert d["status"] == "draft"
        assert d["id"] != pytest.proj_id
        pytest.dup_id = d["id"]

    def test_archive_and_filter(self, s1):
        r = s1.patch(f"{API}/projects/{pytest.dup_id}", json={"archived": True})
        assert r.status_code == 200
        assert r.json()["archived"] is True
        # not in default listing
        r = s1.get(f"{API}/projects")
        ids = [x["id"] for x in r.json()]
        assert pytest.dup_id not in ids
        # in archived listing
        r = s1.get(f"{API}/projects?include_archived=true")
        ids = [x["id"] for x in r.json()]
        assert pytest.dup_id in ids

    def test_delete(self, s1):
        r = s1.delete(f"{API}/projects/{pytest.dup_id}")
        assert r.status_code == 200
        r = s1.get(f"{API}/projects/{pytest.dup_id}")
        assert r.status_code == 404

    def test_list_sorted_desc(self, s1):
        # create two more and verify order
        s1.post(f"{API}/projects", json={"prompt": "second one"})
        s1.post(f"{API}/projects", json={"prompt": "third one"})
        r = s1.get(f"{API}/projects")
        items = r.json()
        assert len(items) >= 3
        ts = [x["updated_at"] for x in items]
        assert ts == sorted(ts, reverse=True)


# ---------------- Sample data ----------------
class TestSample:
    def test_load_sample_creates_4(self, s1):
        r = s1.post(f"{API}/projects/load-sample")
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) == 4
        statuses = sorted([p["status"] for p in arr])
        assert statuses == sorted(["live", "draft", "building", "failed"])

    def test_load_sample_idempotent(self, s1):
        r = s1.post(f"{API}/projects/load-sample")
        assert r.status_code == 200
        # count samples
        r = s1.get(f"{API}/projects?include_archived=true")
        samples = [p for p in r.json() if p.get("is_sample")]
        assert len(samples) == 4


# ---------------- User prefs / Onboarding ----------------
class TestUserPrefs:
    def test_patch_prefs(self, s1):
        r = s1.patch(f"{API}/users/me", json={"mode": "pro", "theme": "light"})
        assert r.status_code == 200
        d = r.json()
        assert d["mode"] == "pro"
        assert d["theme"] == "light"
        # reset
        s1.patch(f"{API}/users/me", json={"mode": "simple", "theme": "dark"})

    def test_onboarding_persist(self):
        s = requests.Session(); s.headers.update(H(TOKEN_ONBOARD))
        # first make sure onboarding_completed is false
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 200
        r = s.post(f"{API}/users/me/onboarding", json={
            "goals": ["ship_fast", "learn"],
            "work_style": "no_code",
            "connected": {"github": False},
            "mode": "pro",
        })
        assert r.status_code == 200
        d = r.json()
        assert d["onboarding_completed"] is True
        assert d["mode"] == "pro"
        assert d["onboarding_prefs"]["goals"] == ["ship_fast", "learn"]
        assert d["onboarding_prefs"]["work_style"] == "no_code"


# ---------------- Cross-user isolation ----------------
class TestIsolation:
    def test_user_2_cannot_see_user_1(self, s1, s2):
        r = s1.post(f"{API}/projects", json={"prompt": "private user1 project"})
        pid = r.json()["id"]
        # user 2 list should not include
        r = s2.get(f"{API}/projects?include_archived=true")
        assert pid not in [x["id"] for x in r.json()]
        # 404 on cross-user get
        r = s2.get(f"{API}/projects/{pid}")
        assert r.status_code == 404
        # 404 on cross-user patch
        r = s2.patch(f"{API}/projects/{pid}", json={"name": "hack"})
        assert r.status_code == 404
        # 404 on cross-user delete
        r = s2.delete(f"{API}/projects/{pid}")
        assert r.status_code == 404


# ---------------- Messages (Phase 2) ----------------
class TestMessages:
    def test_create_project_and_post_messages(self, s1):
        r = s1.post(f"{API}/projects", json={"prompt": "Chat msg project"})
        assert r.status_code == 200
        pid = r.json()["id"]
        pytest.msg_pid = pid
        orig_edited = r.json()["last_edited"]

        # list empty
        r = s1.get(f"{API}/projects/{pid}/messages")
        assert r.status_code == 200 and r.json() == []

        # post text
        r = s1.post(f"{API}/projects/{pid}/messages", json={"role": "user", "content": "hi", "kind": "text"})
        assert r.status_code == 200
        m1 = r.json()
        assert m1["project_id"] == pid and m1["role"] == "user" and m1["kind"] == "text"

        # post plan
        r = s1.post(f"{API}/projects/{pid}/messages", json={"role": "assistant", "kind": "plan", "meta": {"sections": [{"title": "Auth"}]}})
        assert r.status_code == 200
        assert r.json()["kind"] == "plan"
        assert r.json()["meta"]["sections"][0]["title"] == "Auth"

        # post build
        r = s1.post(f"{API}/projects/{pid}/messages", json={"role": "assistant", "kind": "build", "meta": {"steps": [{"id": "s1"}]}})
        assert r.status_code == 200 and r.json()["kind"] == "build"

        # list all 3, sorted by created_at asc
        r = s1.get(f"{API}/projects/{pid}/messages")
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) == 3
        kinds = [m["kind"] for m in arr]
        assert kinds == ["text", "plan", "build"]

        # project.last_edited updated
        r = s1.get(f"{API}/projects/{pid}")
        assert r.json()["last_edited"] >= orig_edited

    def test_messages_cross_user_404(self, s1, s2):
        r = s2.get(f"{API}/projects/{pytest.msg_pid}/messages")
        assert r.status_code == 404
        r = s2.post(f"{API}/projects/{pytest.msg_pid}/messages", json={"role": "user", "content": "hack"})
        assert r.status_code == 404


# ---------------- Project PATCH mode/status (Phase 2) ----------------
class TestProjectPatchPhase2:
    def test_patch_status_live_and_mode_pro(self, s1):
        r = s1.post(f"{API}/projects", json={"prompt": "phase2 patch"})
        pid = r.json()["id"]
        r = s1.patch(f"{API}/projects/{pid}", json={"status": "live"})
        assert r.status_code == 200 and r.json()["status"] == "live"
        r = s1.patch(f"{API}/projects/{pid}", json={"mode": "pro"})
        assert r.status_code == 200 and r.json()["mode"] == "pro"
        r = s1.patch(f"{API}/projects/{pid}", json={"name": "PhasedTwo"})
        assert r.status_code == 200 and r.json()["name"] == "PhasedTwo"
        # persistence
        r = s1.get(f"{API}/projects/{pid}")
        d = r.json()
        assert d["status"] == "live" and d["mode"] == "pro" and d["name"] == "PhasedTwo"


# ---------------- Agents (Phase 2) ----------------
class TestAgents:
    @classmethod
    def setup_class(cls):
        # Clean agents for both users to trigger fresh auto-seed on s1
        import os as _os
        from pymongo import MongoClient
        from dotenv import load_dotenv
        load_dotenv("/app/backend/.env")
        _c = MongoClient(_os.environ["MONGO_URL"])
        _db = _c[_os.environ["DB_NAME"]]
        _db.agents.delete_many({"user_id": {"$in": ["user_testseed01", "user_testseed02"]}})

    def test_get_agents_auto_seeds(self, s1):
        r = s1.get(f"{API}/agents")
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) == 2
        names = sorted([a["name"] for a in arr])
        assert names == ["Helpdesk Copilot", "Research Scout"]
        for a in arr:
            assert a["user_id"] == "user_testseed01"
            assert a["is_sample"] is True

    def test_get_agents_second_call_no_reseed(self, s1):
        r = s1.get(f"{API}/agents")
        assert r.status_code == 200
        assert len(r.json()) == 2  # not 4

    def test_create_agent_draft(self, s1):
        r = s1.post(f"{API}/agents", json={
            "name": "TEST_MyAgent", "goal": "do things", "framework": "LangGraph",
            "model": "Claude Sonnet 4.6", "tools": ["Web search"], "system_prompt": "hi"
        })
        assert r.status_code == 200
        a = r.json()
        assert a["status"] == "draft"
        assert a["user_id"] == "user_testseed01"
        assert a["name"] == "TEST_MyAgent"
        assert a["tools"] == ["Web search"]
        pytest.agent_id = a["id"]

    def test_get_agent_by_id(self, s1):
        r = s1.get(f"{API}/agents/{pytest.agent_id}")
        assert r.status_code == 200
        assert r.json()["id"] == pytest.agent_id

    def test_agent_cross_user_404(self, s2):
        r = s2.get(f"{API}/agents/{pytest.agent_id}")
        assert r.status_code == 404


# ---------------- Logout ----------------
class TestLogout:
    def test_logout_invalidates_session(self):
        # Create disposable session for this test
        import pymongo, datetime
        # Instead call logout with a fresh dummy token seeded via API test session
        # We'll use TOKEN_ONBOARD then re-seed at end.
        s = requests.Session(); s.headers.update(H(TOKEN_ONBOARD))
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401



# ---------------- Data tab CRUD (Phase 2 addition) ----------------
class TestDataRows:
    @classmethod
    def setup_class(cls):
        # Re-seed user_testseed01 session if it was invalidated
        import os as _os
        from pymongo import MongoClient
        from dotenv import load_dotenv
        import datetime as _dt
        load_dotenv("/app/backend/.env")
        _c = MongoClient(_os.environ["MONGO_URL"])
        _db = _c[_os.environ["DB_NAME"]]
        _db.user_sessions.update_one(
            {"session_token": TOKEN_1},
            {"$set": {
                "session_token": TOKEN_1,
                "user_id": "user_testseed01",
                "expires_at": (_dt.datetime.utcnow() + _dt.timedelta(days=7)).isoformat(),
                "created_at": _dt.datetime.utcnow().isoformat(),
            }},
            upsert=True,
        )

    def test_auto_seed_4_demo_rows(self, s1):
        # Create a fresh project to guarantee empty rows
        r = s1.post(f"{API}/projects", json={"prompt": "data tab project"})
        assert r.status_code == 200
        pid = r.json()["id"]
        pytest.data_pid = pid

        r = s1.get(f"{API}/projects/{pid}/data/rows")
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == 4
        names = [x["name"] for x in rows]
        assert names == ["Acme Inc", "Globex", "Initech", "Umbrella"]
        for row in rows:
            assert row["project_id"] == pid
            assert row["user_id"] == "user_testseed01"
            assert "id" in row and row["id"].startswith("row_")

    def test_get_rows_idempotent(self, s1):
        r = s1.get(f"{API}/projects/{pytest.data_pid}/data/rows")
        assert r.status_code == 200
        assert len(r.json()) == 4  # not 8

    def test_create_row_persists(self, s1):
        r = s1.post(f"{API}/projects/{pytest.data_pid}/data/rows",
                    json={"name": "TEST_Startup", "plan": "Pro", "mrr": "999", "status": "Active"})
        assert r.status_code == 200
        row = r.json()
        assert row["name"] == "TEST_Startup"
        pytest.new_row_id = row["id"]
        # verify via GET
        r = s1.get(f"{API}/projects/{pytest.data_pid}/data/rows")
        ids = [x["id"] for x in r.json()]
        assert pytest.new_row_id in ids
        assert len(r.json()) == 5

    def test_patch_row_persists(self, s1):
        r = s1.patch(f"{API}/projects/{pytest.data_pid}/data/rows/{pytest.new_row_id}",
                     json={"plan": "Enterprise"})
        assert r.status_code == 200
        assert r.json()["plan"] == "Enterprise"
        assert r.json()["name"] == "TEST_Startup"  # unchanged fields intact
        # persistence via list
        r = s1.get(f"{API}/projects/{pytest.data_pid}/data/rows")
        found = [x for x in r.json() if x["id"] == pytest.new_row_id][0]
        assert found["plan"] == "Enterprise"

    def test_delete_row_persists(self, s1):
        r = s1.delete(f"{API}/projects/{pytest.data_pid}/data/rows/{pytest.new_row_id}")
        assert r.status_code == 200
        r = s1.get(f"{API}/projects/{pytest.data_pid}/data/rows")
        ids = [x["id"] for x in r.json()]
        assert pytest.new_row_id not in ids
        assert len(r.json()) == 4

    def test_patch_missing_row_404(self, s1):
        r = s1.patch(f"{API}/projects/{pytest.data_pid}/data/rows/row_nonexistent",
                     json={"plan": "X"})
        assert r.status_code == 404

    def test_delete_missing_row_404(self, s1):
        r = s1.delete(f"{API}/projects/{pytest.data_pid}/data/rows/row_nonexistent")
        assert r.status_code == 404

    def test_cross_user_list_404(self, s2):
        r = s2.get(f"{API}/projects/{pytest.data_pid}/data/rows")
        assert r.status_code == 404

    def test_cross_user_create_404(self, s2):
        r = s2.post(f"{API}/projects/{pytest.data_pid}/data/rows", json={"name": "hack"})
        assert r.status_code == 404

    def test_cross_user_patch_404(self, s1, s2):
        # get an existing row belonging to user1
        rows = s1.get(f"{API}/projects/{pytest.data_pid}/data/rows").json()
        rid = rows[0]["id"]
        r = s2.patch(f"{API}/projects/{pytest.data_pid}/data/rows/{rid}", json={"plan": "hack"})
        assert r.status_code == 404

    def test_cross_user_delete_404(self, s1, s2):
        rows = s1.get(f"{API}/projects/{pytest.data_pid}/data/rows").json()
        rid = rows[0]["id"]
        r = s2.delete(f"{API}/projects/{pytest.data_pid}/data/rows/{rid}")
        assert r.status_code == 404

    def test_rows_scoped_to_project(self, s1):
        # Create a second project; its rows should be independent 4 fresh seeds
        r = s1.post(f"{API}/projects", json={"prompt": "second data project"})
        pid2 = r.json()["id"]
        r = s1.get(f"{API}/projects/{pid2}/data/rows")
        assert r.status_code == 200
        assert len(r.json()) == 4
        # ids should differ from pid1
        pid1_rows = s1.get(f"{API}/projects/{pytest.data_pid}/data/rows").json()
        ids1 = set(x["id"] for x in pid1_rows)
        ids2 = set(x["id"] for x in r.json())
        assert ids1.isdisjoint(ids2)
