
const KEY = "library_session";

const API_BASE_URL = "https://library-desk-backend.onrender.com";

export const session = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  },
  set: (s) => localStorage.setItem(KEY, JSON.stringify(s)),
  clear: () => localStorage.removeItem(KEY),
};

const auth = () => {
  const s = session.get();
  return s ? { Authorization: `Bearer ${s.token}` } : {};
};

async function request(url, options = {}) {
  let res;

  try {
    res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...auth(),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Can't reach the server. Please check your backend deployment.");
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && session.get()) {
    session.clear();
    window.location.reload();
  }

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

const send = (method, data) => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

// Authentication
export const login = (email, password) =>
  request("/api/auth/login", send("POST", { email, password }));

export const register = (form) =>
  request("/api/auth/register", send("POST", form));

// Books
export const getBooks = (params) =>
  request(`/api/books?${new URLSearchParams(params)}`);

export const createBook = (b) =>
  request("/api/books", send("POST", b));

export const updateBook = (id, b) =>
  request(`/api/books/${id}`, send("PUT", b));

export const deleteBook = (id) =>
  request(`/api/books/${id}`, send("DELETE"));

// Members
export const getMembers = () =>
  request("/api/members");

export const getLoans = () =>
  request("/api/loans");

export const issueLoan = (data) =>
  request("/api/loans/issue", send("POST", data));

export const returnLoan = (id) =>
  request(`/api/loans/${id}/return`, send("PATCH"));

export const getSummary = () =>
  request("/api/reports/summary");

// Download
export async function download(path, filename) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: auth(),
  });

  if (!res.ok) {
    throw new Error("Download failed");
  }

  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// Additional Member operations
export const createMember = (m) =>
  request("/api/members", send("POST", m));

export const updateMember = (id, m) =>
  request(`/api/members/${id}`, send("PUT", m));

export const deleteMember = (id) =>
  request(`/api/members/${id}`, send("DELETE"));

// Requests
export const getRequests = () =>
  request("/api/requests");

export const createRequest = (bookId) =>
  request("/api/requests", send("POST", { bookId }));

export const decideRequest = (id, action, days) =>
  request(`/api/requests/${id}`, send("PATCH", { action, days }));

// Profile
export const updateMe = (data) =>
  request("/api/auth/me", send("PUT", data));

// Fine payment
export const payFine = (id) =>
  request(`/api/loans/${id}/pay`, send("PATCH"));
