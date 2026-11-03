import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../api.js";

const date = (d) => new Date(d).toLocaleDateString("en-GB");
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const cls = (s) => (s === "Overdue" ? "late" : s === "On loan" ? "out" : "in");

function useEscape(onClose) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
}

function MemberModal({ member, onSave, onClose }) {
  useEscape(onClose);
  const [form, setForm] = useState({ name: member?.name || "", email: member?.email || "", password: "" });
  const [error, setError] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const data = { ...form };
    if (member && !data.password) delete data.password;
    const msg = await onSave(data);
    if (msg) setError(msg);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" role="dialog" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{member ? "Edit member" : "Add a member"}</h2>
        {error && <div className="error" role="alert">{error}</div>}
        <label>Name<input name="name" value={form.name} onChange={change} required autoFocus /></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={change} required /></label>
        <label>{member ? "New password (leave blank to keep)" : "Password"}
          <input name="password" type="password" value={form.password} onChange={change} minLength={6} required={!member} />
        </label>
        <div className="actions">
          <button className="primary" type="submit">{member ? "Save changes" : "Add member"}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Drawer({ m, onClose }) {
  useEscape(onClose);
  return (
    <div className="overlay right" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="who-cell">
          <span className="avatar big">{initials(m.name)}</span>
          <div><h2>{m.name}</h2><small>{m.email}</small></div>
        </div>
        <p className="meta">Member since {date(m.createdAt)}</p>
        <dl className="tiles mini">
          <div><dd>{m.active}</dd><dt>Books out</dt></div>
          <div><dd>{m.overdue}</dd><dt>Overdue</dt></div>
          <div><dd>₹{m.fines}</dd><dt>Fines</dt></div>
        </dl>
        <h3>Loan history</h3>
        {m.mine.length ? (
          <ul className="hist">
            {m.mine.map((l) => (
              <li key={l._id}>
                <div><strong>{l.book?.title || "(deleted book)"}</strong><div className="meta">{date(l.issuedOn)} → due {date(l.dueDate)}</div></div>
                <div className="right"><span className={`status ${cls(l.state)}`}>{l.state}</span>{l.fine > 0 && <div className="meta">₹{l.fine}{l.paidOn ? " paid" : " due"}</div>}</div>
              </li>
            ))}
          </ul>
        ) : <p className="empty">No loans yet.</p>}
        <button onClick={onClose}>Close</button>
      </aside>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [m, l] = await Promise.all([api.getMembers(), api.getLoans()]);
      setMembers(m); setLoans(l); setError("");
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => members.map((m) => {
    const mine = loans.filter((l) => l.member?._id === m._id);
    const active = mine.filter((l) => !l.returnedOn);
    return { ...m, mine, active: active.length, overdue: active.filter((l) => l.state === "Overdue").length, fines: mine.reduce((s, l) => s + l.fineDue, 0) };
  }), [members, loans]);

  const shown = rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase()));
  const viewing = rows.find((r) => r._id === viewId);

  const save = async (data) => {
    try {
      if (modal.member) await api.updateMember(modal.member._id, data); else await api.createMember(data);
      setModal(null); await load(); return null;
    } catch (e) { return e.message; }
  };

  const remove = async (m) => {
    if (!window.confirm(`Remove ${m.name}? Their loan history stays in reports.`)) return;
    try { await api.deleteMember(m._id); await load(); } catch (e) { setError(e.message); }
  };

  const tiles = [["Members", rows.length], ["Have books out", rows.filter((r) => r.active).length],
    ["With overdue books", rows.filter((r) => r.overdue).length], ["Fines owed", `₹${rows.reduce((s, r) => s + r.fines, 0)}`]];

  return (
    <>
      {error && <div className="error" role="alert">{error}</div>}
      <dl className="tiles">{tiles.map(([k, v]) => <div key={k}><dd>{v}</dd><dt>{k}</dt></div>)}</dl>

      <div className="toolbar2">
        <input type="search" placeholder="Search members by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search members" />
        <button className="primary" onClick={() => setModal({ member: null })}>+ Add member</button>
      </div>

      {!shown.length ? (
        <p className="empty">{members.length ? "No members match your search." : "No members yet. Click “Add member” to create the first one."}</p>
      ) : (
        <div className="tablewrap">
          <table>
            <thead><tr><th>Member</th><th>Joined</th><th>Books out</th><th>Overdue</th><th>Fines</th><th>Standing</th><th></th></tr></thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m._id}>
                  <td><div className="who-cell"><span className="avatar">{initials(m.name)}</span><div>{m.name}<small>{m.email}</small></div></div></td>
                  <td>{date(m.createdAt)}</td>
                  <td>{m.active}</td>
                  <td>{m.overdue || "–"}</td>
                  <td>{m.fines ? `₹${m.fines}` : "–"}</td>
                  <td>{m.overdue ? <span className="status late">Overdue</span> : m.fines ? <span className="status out">Fines due</span> : <span className="status in">Good standing</span>}</td>
                  <td><div className="actions">
                    <button onClick={() => setViewId(m._id)}>View</button>
                    <button onClick={() => setModal({ member: m })}>Edit</button>
                    <button className="danger" onClick={() => remove(m)}>Remove</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <MemberModal member={modal.member} onSave={save} onClose={() => setModal(null)} />}
      {viewing && <Drawer m={viewing} onClose={() => setViewId(null)} />}
    </>
  );
}
