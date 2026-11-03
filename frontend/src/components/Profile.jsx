import { useState } from "react";
import * as api from "../api.js";

export default function Profile({ user, onUpdate }) {
  const [form, setForm] = useState({ name: user.name, currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const s = await api.updateMe(form);
      api.session.set(s);
      onUpdate(s.user);
      setForm({ ...form, currentPassword: "", newPassword: "" });
      setError(""); setNotice("Profile updated.");
    } catch (err) { setNotice(""); setError(err.message); }
  };

  return (
    <form className="panel profile" onSubmit={submit}>
      <h2>Your profile</h2>
      {error && <div className="error" role="alert">{error}</div>}
      {notice && <div className="notice" role="status">{notice}</div>}
      <label>Email<input value={user.email} disabled /></label>
      <label>Role<input value={user.role} disabled /></label>
      <label>Name<input name="name" value={form.name} onChange={change} required /></label>
      <h3>Change password</h3>
      <label>Current password<input name="currentPassword" type="password" value={form.currentPassword} onChange={change} /></label>
      <label>New password<input name="newPassword" type="password" value={form.newPassword} onChange={change} minLength={6} /></label>
      <button className="primary" type="submit">Save changes</button>
    </form>
  );
}
