# Library Desk - MERN Library Management System

**Stack:** MongoDB, Express.js, React (Vite), Node.js. Auth with JWT, passwords hashed with bcrypt.

## Run
```bash
npm run install-all
npm run dev
```
Open http://localhost:5173 (needs Node 18+ and MongoDB running, or an Atlas URI in `backend/.env`).

## Demo logins (created automatically on first start)
| Role | Email | Password |
|---|---|---|
| Admin | admin@library.com | admin123 |
| Member | priya@library.com | member123 |
| Member | ravi@library.com | member123 |
| Member | ananya@library.com | member123 |

Sample books, loans (one overdue, one with a fine) and a pending request are added when the database has no books.
To reset everything to the demo data: `cd backend` then `npm run seed`.
To make another account an admin: `cd backend` then `npm run make-admin -- email@example.com`.

## Pages
| Page | Who | What it does |
|---|---|---|
| Login / Register | everyone | JWT login; new accounts are members |
| Dashboard | admin | totals, overdue, fines, genre and monthly charts, overdue and recent loans |
| Books | all | search and filter; admin adds, edits, deletes and issues; members request books |
| Loans | all | admin: all loans, mark returned, export CSV and PDF; member: own loans |
| Requests | all | members track requests; admin approves (issues the book) or rejects |
| Members | admin | add, edit, remove, search, per-member loan history and fines |
| Home | member | books borrowed, due dates, fines, pending requests |
| Profile | all | change name and password |

Fines are Rs 5 per late day (`FINE_PER_DAY` in `backend/.env`). They grow until the book is returned; then the admin collects the fine and clicks **Mark fine paid** on the Loans page. The Dashboard shows fines collected and pending separately.
