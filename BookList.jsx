import { useState } from "react";

const SPINES = { Fiction: "#0F766E", Science: "#2F5BEA", History: "#9A3412", Technology: "#6D28D9", Biography: "#BE185D", Other: "#64748B" };

function BookRow({ book, admin, members, onEdit, onDelete, onIssue, onRequest }) {
  const [issuing, setIssuing] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [days, setDays] = useState(14);
  const issued = book.status === "Issued";

  const submit = async (e) => {
    e.preventDefault();
    if (await onIssue({ bookId: book._id, memberId, days: Number(days) })) { setIssuing(false); setMemberId(""); }
  };

  return (
    <li className="book" style={{ "--spine": SPINES[book.genre] || SPINES.Other }}>
      <div className="info">
        <h3>{book.title}</h3>
        <p>{book.author}{book.year ? `, ${book.year}` : ""}</p>
        <p className="meta">ISBN {book.isbn} · {book.genre}</p>
      </div>
      <div className="side">
        <span className={`status ${issued ? "out" : "in"}`}>{issued ? "Issued" : "Available"}</span>
        {!admin && !issued && <button onClick={() => onRequest(book._id)}>Request this book</button>}
        {admin && (issuing ? (
          <form className="inline" onSubmit={submit}>
            <select required value={memberId} onChange={(e) => setMemberId(e.target.value)} aria-label="Member">
              <option value="">{members.length ? "Choose member" : "No members yet"}</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <input type="number" min="1" max="90" value={days} onChange={(e) => setDays(e.target.value)} aria-label="Loan days" style={{ width: 64 }} />
            <span className="meta">days</span>
            <button className="primary" type="submit">Issue</button>
            <button type="button" onClick={() => setIssuing(false)}>Cancel</button>
          </form>
        ) : (
          <div className="actions">
            {!issued && <button onClick={() => setIssuing(true)}>Issue</button>}
            <button onClick={() => onEdit(book)}>Edit</button>
            <button className="danger" onClick={() => onDelete(book)}>Delete</button>
          </div>
        ))}
      </div>
    </li>
  );
}

export default function BookList({ books, loading, ...rest }) {
  if (loading) return <p className="empty">Loading books…</p>;
  if (!books.length) return <p className="empty">No books match your search.</p>;
  return <ul className="shelf">{books.map((b) => <BookRow key={b._id} book={b} {...rest} />)}</ul>;
}
