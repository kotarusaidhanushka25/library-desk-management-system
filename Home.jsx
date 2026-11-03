import { useEffect, useState } from "react";
import * as api from "../api.js";

const left = (d) => Math.ceil((new Date(d) - new Date()) / 864e5);
const label = (n) => (n < 0 ? `${-n} day${n === -1 ? "" : "s"} overdue` : n === 0 ? "due today" : `${n} day${n === 1 ? "" : "s"} left`);

export default function Home({ user, go }) {
  const [loans, setLoans] = useState(null);
  const [reqs, setReqs] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.getLoans(), api.getRequests()]).then(([l, r]) => { setLoans(l); setReqs(r); }).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error" role="alert">{error}</div>;
  if (!loans) return <p className="empty">Loading…</p>;

  const active = loans.filter((l) => !l.returnedOn);
  const tiles = [
    ["Books borrowed", active.length],
    ["Overdue", active.filter((l) => l.state === "Overdue").length],
    ["Fines due", `₹${loans.reduce((s, l) => s + l.fineDue, 0)}`],
    ["Pending requests", reqs.filter((r) => r.status === "Pending").length],
  ];

  return (
    <>
      <p className="lead">Welcome back, {user.name.split(" ")[0]}.</p>
      <dl className="tiles">{tiles.map(([k, v]) => <div key={k}><dd>{v}</dd><dt>{k}</dt></div>)}</dl>
      <section className="chart">
        <h2>Currently borrowed</h2>
        {active.length ? (
          <ul className="hist">
            {active.map((l) => (
              <li key={l._id}>
                <div><strong>{l.book?.title}</strong><div className="meta">{l.book?.author}</div></div>
                <span className={`status ${l.state === "Overdue" ? "late" : "out"}`}>{label(left(l.dueDate))}{l.fine ? ` · ₹${l.fine}` : ""}</span>
              </li>
            ))}
          </ul>
        ) : <p className="empty">You have no books right now.</p>}
        <div className="actions"><button className="primary" onClick={() => go("books")}>Browse books</button></div>
      </section>
    </>
  );
}
