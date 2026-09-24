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
