import { useState } from "react";
import * as api from "../api.js";

export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const s = mode === "login" ? await api.login(form.email, form.password) : await api.register(form);
      api.session.set(s);
      onAuth(s.user);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="authwrap">
      <div className="authbrand">
        <h1>Library Desk</h1>
        <p>Books, members, loans and fines in one place.</p>
      </div>
      <div className="authform">
        <form className="panel" onSubmit={submit}>
          <h2>{mode === "login" ? "Log in" : "Create an account"}</h2>
          {error && <div className="error" role="alert">{error}</div>}
          {mode === "register" && <label>Name<input name="name" value={form.name} onChange={change} required /></label>}
          <label>Email<input name="email" type="email" value={form.email} onChange={change} required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={change} required minLength={6} /></label>
          <button className="primary" type="submit">{mode === "login" ? "Log in" : "Create account"}</button>
          <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
          </button>
          <p className="meta">{mode === "login" ? "Demo admin: admin@library.com / admin123" : "New accounts are created as members."}</p>
        </form>
      </div>
    </div>
  );
}
