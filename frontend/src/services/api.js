const API_BASE = "http://localhost:8000/api";

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchWorkflows() {
  const res = await fetch(`${API_BASE}/workflows`);
  if (!res.ok) throw new Error("Failed to fetch workflows");
  return res.json();
}

export async function fetchWorkflow(id) {
  const res = await fetch(`${API_BASE}/workflows/${id}`);
  if (!res.ok) throw new Error("Failed to fetch workflow");
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchReview(id) {
  const res = await fetch(`${API_BASE}/reviews/${id}`);
  if (!res.ok) throw new Error("Failed to fetch review");
  return res.json();
}

export async function fetchRepos() {
  const res = await fetch(`${API_BASE}/repos`);
  if (!res.ok) throw new Error("Failed to fetch repos");
  return res.json();
}

export async function connectRepo(name, owner) {
  const res = await fetch(`${API_BASE}/repos/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, owner })
  });
  if (!res.ok) throw new Error("Failed to connect repository");
  return res.json();
}

export async function triggerWorkflow(repoName, prNumber, prTitle) {
  const res = await fetch(`${API_BASE}/workflows/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo_name: repoName,
      pr_number: prNumber,
      pr_title: prTitle
    })
  });
  if (!res.ok) throw new Error("Failed to trigger review workflow");
  return res.json();
}
