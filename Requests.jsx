import { useCallback, useEffect, useState } from "react";
import * as api from "../api.js";

const date = (d) => new Date(d).toLocaleDateString("en-GB");
const cls = (s) => (s === "Approved" ? "in" : s === "Rejected" ? "late" : "out");

export default function Requests({ admin }) {
  const [reqs, setReqs] = useState([]);
  const [days, setDays] = useState(14);
  const [error, setError] = useState("");

  const load = useCallback(() => api.getRequests().then(setReqs).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const decide = async (id, action) => {
    try { await api.decideRequest(id, action, Number(days)); setError(""); await load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <>
      {error && <div className="error" role="alert">{error}</div>}
      {admin && (
        <div className="toolbar2">
          <label className="inlinelabel">Loan period when approving
            <select value={days} onChange={(e) => setDays(e.target.value)}>
              {[7, 14, 21, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
            </select>
          </label>
        </div>
      )}
      {!reqs.length ? (
        <p className="empty">{admin ? "No requests yet. Members can request books from the Books page." : "You haven't requested any books. Open Books and click “Request this book”."}</p>
      ) : (
        <div className="tablewrap">
          <table>
            <thead><tr><th>Book</th>{admin && <th>Member</th>}<th>Requested</th><th>Status</th>{admin && <th></th>}</tr></thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r._id}>
                  <td>{r.book?.title || "(deleted book)"}</td>
                  {admin && <td>{r.member?.name}</td>}
                  <td>{date(r.createdAt)}</td>
                  <td><span className={`status ${cls(r.status)}`}>{r.status}</span></td>
                  {admin && <td>{r.status === "Pending" && (
                    <div className="actions">
                      <button className="primary" onClick={() => decide(r._id, "approve")}>Approve &amp; issue</button>
                      <button className="danger" onClick={() => decide(r._id, "reject")}>Reject</button>
                    </div>
                  )}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
