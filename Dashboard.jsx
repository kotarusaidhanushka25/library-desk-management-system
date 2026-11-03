import { useEffect, useState } from "react";
import * as api from "../api.js";

const date = (d) => new Date(d).toLocaleDateString("en-GB");

function Bars({ title, data, vertical }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <section className="chart">
      <h2>{title}</h2>
      <div className={vertical ? "bars v" : "bars"}>
        {data.map((d) => (
          <div className="bar" key={d.label}>
            <span className="lbl">{d.label}</span>
            <span className="track"><span className="fill" style={vertical ? { height: `${(d.count / max) * 100}%` } : { width: `${(d.count / max) * 100}%` }} /></span>
            <span className="num">{d.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.getSummary(), api.getLoans()]).then(([s, l]) => { setD(s); setLoans(l); }).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error" role="alert">{error}</div>;
  if (!d) return <p className="empty">Loading dashboard…</p>;

  const tiles = [["Books", d.books], ["Members", d.members], ["On loan", d.issued], ["Overdue", d.overdue], ["Fines collected", `₹${d.finesCollected}`], ["Fines pending", `₹${d.finesPending}`]];
  const overdue = loans.filter((l) => l.state === "Overdue");

  return (
    <>
      <dl className="tiles">{tiles.map(([k, v]) => <div key={k}><dd>{v}</dd><dt>{k}</dt></div>)}</dl>
      <div className="charts">
        <Bars title="Books by genre" data={d.byGenre} />
        <Bars title="Loans per month" data={d.monthly} vertical />
      </div>
      <div className="charts gap">
        <section className="chart">
          <h2>Overdue now</h2>
          {overdue.length ? (
            <ul className="hist">{overdue.map((l) => (
              <li key={l._id}><div><strong>{l.book?.title}</strong><div className="meta">{l.member?.name} · due {date(l.dueDate)}</div></div><span className="status late">₹{l.fine}</span></li>
            ))}</ul>
          ) : <p className="empty">Nothing overdue. 🎉</p>}
        </section>
        <section className="chart">
          <h2>Recent loans</h2>
          {loans.length ? (
            <ul className="hist">{loans.slice(0, 5).map((l) => (
              <li key={l._id}><div><strong>{l.book?.title}</strong><div className="meta">{l.member?.name} · {date(l.issuedOn)}</div></div><span className="meta">{l.state}</span></li>
            ))}</ul>
          ) : <p className="empty">No loans yet.</p>}
        </section>
      </div>
    </>
  );
}
