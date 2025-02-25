export function loginUser() {
    return fetch("/api/login", { method: "POST" }).then((res) => res.json());
  }