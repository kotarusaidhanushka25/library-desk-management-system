import { useCallback, useEffect, useState } from "react";
import * as api from "../api.js";

const date = (d) => new Date(d).toLocaleDateString("en-GB");

function FineCell({ l }) {
  if (!l.fine) return "–";
  if (l.paidOn) return <span className="status in">Paid ₹{l.paidAmount} · {date(l.paidOn)}</span>;
  return <span className={`status ${l.returnedOn ? "out" : "late"}`}>₹{l.fine}{l.returnedOn ? " unpaid" : " and growing"}</span>;
}

export default function Loans({ admin }) {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(() => api.getLoans().then(setLoans).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const act = async (fn) => { try { await fn(); setError(""); await load(); } catch (e) { setError(e.message); } };
  const collect = (l) => {
    if (window.confirm(`Collect ₹${l.fine} fine from ${l.member?.name}?`)) act(() => api.payFine(l._id));
  };

  return (
    <>
      {error && <div className="error" role="alert">{error}</div>}
      {admin && (
        <div className="actions bar">
          <button onClick={() => act(() => api.download("/api/reports/export/csv", "loans.csv"))}>Export CSV</button>
          <button onClick={() => act(() => api.download("/api/reports/export/pdf", "loans-report.pdf"))}>Export PDF</button>
        </div>
      )}
      {!loans.length ? (
        <p className="empty">No loans yet.{admin ? " Add a member, then click Issue on a book in the Books tab." : ""}</p>
      ) : (
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Book</th>{admin && <th>Member</th>}<th>Issued</th><th>Due</th><th>Status</th><th>Fine</th>{admin && <th></th>}</tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l._id}>
                  <td>{l.book?.title || "(deleted book)"}</td>
                  {admin && <td>{l.member?.name || "(deleted)"}</td>}
                  <td>{date(l.issuedOn)}</td>
                  <td>{date(l.dueDate)}</td>
                  <td><span className={`status ${l.state === "Overdue" ? "late" : l.state === "On loan" ? "out" : "in"}`}>{l.state}</span></td>
                  <td><FineCell l={l} /></td>
                  {admin && (
                    <td>
                      {!l.returnedOn && <button onClick={() => act(() => api.returnLoan(l._id))}>Mark returned</button>}
                      {l.returnedOn && l.fine > 0 && !l.paidOn && <button className="primary" onClick={() => collect(l)}>Mark fine paid</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
