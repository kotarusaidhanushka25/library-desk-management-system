import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Home from "./components/Home.jsx";
import Books from "./components/Books.jsx";
import Loans from "./components/Loans.jsx";
import Requests from "./components/Requests.jsx";
import Members from "./components/Members.jsx";
import Profile from "./components/Profile.jsx";
import * as api from "./api.js";

const ICONS = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  books: "M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11",
  loans: "M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4",
  requests: "M5 4h14v16H5zM9 9h6M9 13h6",
  members: "M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M16 11a3 3 0 100-6M21 20a6 6 0 00-4-5.6",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  logout: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
};
const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[name]} />
  </svg>
);

export default function App() {
  const [user, setUser] = useState(() => api.session.get()?.user || null);
  const admin = user?.role === "admin";
  const [tab, setTab] = useState("books");
  useEffect(() => { setTab(admin ? "dashboard" : "home"); }, [admin]);

  if (!user) return <Login onAuth={setUser} />;

  const nav = admin
    ? [["dashboard", "Dashboard"], ["books", "Books"], ["loans", "Loans"], ["requests", "Requests"], ["members", "Members"], ["profile", "Profile"]]
    : [["home", "Home"], ["books", "Books"], ["loans", "My loans"], ["requests", "My requests"], ["profile", "Profile"]];
  const logout = () => { api.session.clear(); setUser(null); };
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Library Desk</div>
        <nav>
          {nav.map(([id, label]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}><Icon name={id} /> {label}</button>
          ))}
        </nav>
        <div className="who">
          <span className="avatar">{initials}</span>
          <div><strong>{user.name}</strong><small>{user.role}</small></div>
        </div>
        <button onClick={logout}><Icon name="logout" /> Log out</button>
      </aside>
      <main className="main">
        <h1 className="pagetitle">{nav.find(([id]) => id === tab)?.[1]}</h1>
        {tab === "dashboard" && <Dashboard />}
        {tab === "home" && <Home user={user} go={setTab} />}
        {tab === "books" && <Books admin={admin} />}
        {tab === "loans" && <Loans admin={admin} />}
        {tab === "requests" && <Requests admin={admin} />}
        {tab === "members" && <Members />}
        {tab === "profile" && <Profile user={user} onUpdate={setUser} />}
      </main>
    </div>
  );
}
