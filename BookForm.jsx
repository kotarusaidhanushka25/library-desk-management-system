import { useEffect, useState } from "react";

export const GENRES = ["Fiction", "Science", "History", "Technology", "Biography", "Other"];
const empty = { title: "", author: "", isbn: "", genre: "Fiction", year: "" };

export default function BookForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(editing ? { ...empty, ...editing, year: editing.year ?? "" } : empty);
  }, [editing]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await onSubmit({ ...form, year: form.year === "" ? undefined : Number(form.year) });
    if (ok) setForm(empty);
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h2>{editing ? "Edit book" : "Add a book"}</h2>
      <label>Title<input name="title" value={form.title} onChange={change} required /></label>
      <label>Author<input name="author" value={form.author} onChange={change} required /></label>
      <label>ISBN<input name="isbn" value={form.isbn} onChange={change} required /></label>
      <div className="two">
        <label>Genre
          <select name="genre" value={form.genre} onChange={change}>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label>Year<input name="year" type="number" value={form.year} onChange={change} /></label>
      </div>
      <div className="actions">
        <button className="primary" type="submit">{editing ? "Save changes" : "Add book"}</button>
        {editing && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
