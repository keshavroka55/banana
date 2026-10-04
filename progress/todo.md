# Project Development Todo

## Phase 1 — Freeze Current Game

* [ ] Move current frontend into `client/`
* [ ] Run the game and make sure it still works
* [ ] Create `server/`
* [ ] Create basic Node.js backend
* [ ] Connect `client → backend`
* [ ] Move Banana API communication to the backend
* [ ] Test `client → backend → Banana API`
* [ ] Make sure the original game still works

---

## Phase 2 — Database

* [ ] Install/setup PostgreSQL
* [ ] Connect backend to PostgreSQL
* [ ] Create `users` table
* [ ] Create `games` table
* [ ] Test database connection
* [ ] Save completed games in the database

---

## Phase 3 — Virtual Identity

### Authentication

* [ ] Create `POST /auth/register`
* [ ] Create `POST /auth/login`
* [ ] Create `POST /auth/logout`
* [ ] Create `GET /auth/me`
* [ ] Add password hashing
* [ ] Add session/cookie authentication
* [ ] Test register
* [ ] Test login
* [ ] Test logout

### User Game History

* [ ] Create `GET /games/history`
* [ ] Connect game completion to the database
* [ ] Show logged-in user's game history
* [ ] Make sure users cannot see another user's history

### Roles

* [ ] Add `USER` role
* [ ] Add `ADMIN` role
* [ ] Add role-based authorization
* [ ] Create simple admin dashboard
* [ ] Protect admin routes

---

## Phase 4 — Event-Driven Architecture

### RabbitMQ

* [ ] Install/setup RabbitMQ
* [ ] Connect backend to RabbitMQ
* [ ] Create `UserRegistered` event
* [ ] Publish `UserRegistered` after registration
* [ ] Create email worker
* [ ] Send welcome email from the worker
* [ ] Test registration → RabbitMQ → email worker

### Game Event

* [ ] Create `GameCompleted` event
* [ ] Publish event when a game is completed
* [ ] Create simple statistics/leaderboard processing
* [ ] Test `GameCompleted` event
* [ ] Test RabbitMQ failure handling

---

## Phase 5 — Version Control

* [ ] Create GitHub repository
* [ ] Create GitHub Issues for major tasks
* [ ] Create feature branches
* [ ] Work using meaningful commits
* [ ] Push feature branches to GitHub
* [ ] Create Pull Requests
* [ ] Review Pull Requests
* [ ] Merge Pull Requests
* [ ] Create final release/tag `v1.0.0`
* [ ] Add GitHub Actions
* [ ] Test `push → install → test → build`

---

## Phase 6 — Testing

* [ ] Test registration
* [ ] Test login
* [ ] Test logout
* [ ] Test authorization
* [ ] Test game
* [ ] Test game history
* [ ] Test admin access
* [ ] Test normal user cannot access admin
* [ ] Test Banana API failure
* [ ] Test RabbitMQ failure
* [ ] Test backend errors
* [ ] Fix important bugs

---

## Phase 7 — Evidence

Capture screenshots/videos of:

* [ ] GitHub repository
* [ ] Git branches
* [ ] GitHub Issues
* [ ] Pull Request
* [ ] GitHub Actions
* [ ] PostgreSQL database
* [ ] RabbitMQ
* [ ] Login
* [ ] Game
* [ ] Game history
* [ ] Admin dashboard
* [ ] Network request: `Client → Backend`
* [ ] Backend → Banana API
* [ ] Tests

---

## Phase 8 — Documentation

Create:

```text
docs/
├── architecture.md
├── version-control.md
├── event-driven.md
├── interoperability.md
├── virtual-identity.md
└── testing.md
```

* [ ] Create `docs/` folder
* [ ] Write architecture documentation
* [ ] Write version control documentation
* [ ] Write event-driven documentation
* [ ] Write interoperability documentation
* [ ] Write virtual identity documentation
* [ ] Write testing documentation
* [ ] Add screenshots/evidence where useful

---

# Final Check

* [ ] Original Banana game works
* [ ] Frontend works through backend
* [ ] PostgreSQL works
* [ ] Registration works
* [ ] Login works
* [ ] Logout works
* [ ] Sessions/cookies work
* [ ] User history works
* [ ] User/Admin roles work
* [ ] Admin dashboard works
* [ ] RabbitMQ works
* [ ] Welcome email works
* [ ] `GameCompleted` event works
* [ ] GitHub workflow is complete
* [ ] Tests pass
* [ ] Documentation is complete
* [ ] Evidence/screenshots are ready
* [ ] Final `v1.0.0` release is created

---

# Video Preparation

## 0:00–0:45 — Demonstration

* [ ] Login
* [ ] Play game
* [ ] Finish game
* [ ] Show history
* [ ] Show admin dashboard

## 0:45–2:00 — Architecture

* [ ] Explain frontend
* [ ] Explain backend
* [ ] Explain PostgreSQL
* [ ] Explain Banana API
* [ ] Explain RabbitMQ

## 2:00–4:00 — Interoperability

* [ ] Show `Client → Backend`
* [ ] Show `Backend → Banana API`
* [ ] Explain why the backend is used

## 4:00–6:00 — Virtual Identity

* [ ] Show registration
* [ ] Show login
* [ ] Show cookie/session
* [ ] Show user history
* [ ] Show USER/ADMIN roles

## 6:00–8:00 — Event-Driven Architecture

* [ ] Explain `UserRegistered`
* [ ] Show RabbitMQ
* [ ] Show email worker
* [ ] Explain `GameCompleted`

## 8:00–9:00 — Version Control

* [ ] Show branches
* [ ] Show commits
* [ ] Show Pull Request
* [ ] Show GitHub Actions
* [ ] Show release/tag

## 9:00–10:00 — Conclusion

* [ ] Explain what was achieved
* [ ] Mention the four enterprise themes
* [ ] Show final working system
