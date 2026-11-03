import { useCallback, useEffect, useState } from "react";
import BookForm from "./BookForm.jsx";
import BookList from "./BookList.jsx";
import * as api from "../api.js";

export default function Books({ admin }) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try { setBooks(await api.getBooks({ q: query, status })); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [query, status]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { if (admin) api.getMembers().then(setMembers).catch(() => {}); }, [admin]);

  const run = async (action) => {
    try { await action(); await load(); setError(""); return true; }
    catch (e) { setError(e.message); return false; }
  };

  const save = async (data) => {
    const ok = await run(() => (editing ? api.updateBook(editing._id, data) : api.createBook(data)));
    if (ok) setEditing(null);
    return ok;
  };

  const remove = (book) => {
    if (window.confirm(`Delete "${book.title}"? This can't be undone.`)) run(() => api.deleteBook(book._id));
  };

  const request = async (bookId) => {
    setNotice("");
    if (await run(() => api.createRequest(bookId))) setNotice("Request sent. You can track it under My requests.");
  };

  return (
    <>
      {error && <div className="error" role="alert">{error}</div>}
      {notice && <div className="notice" role="status">{notice}</div>}
      <div className={admin ? "layout" : ""}>
        {admin && <BookForm editing={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
        <section>
          <div className="toolbar">
            <input type="search" placeholder="Search title, author or ISBN" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search books" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All books</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
            </select>
          </div>
          <BookList books={books} loading={loading} admin={admin} members={members}
            onEdit={(b) => { setEditing(b); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onDelete={remove} onIssue={(data) => run(() => api.issueLoan(data))} onRequest={request} />
        </section>
      </div>
    </>
  );
}
