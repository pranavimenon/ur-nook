"use client";

import { useState, useEffect, useCallback } from "react";

type ProjectSummary = {
  id: string;
  name: string;
  unitPreference: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ProjectDashboardClient() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load projects");
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      setNewName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete project");
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "36px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 22, height: 22, border: "2px solid #5fc9e8", position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 4, border: "1px solid #5fc9e8", opacity: 0.6 }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 19, color: "#fff", fontWeight: 600 }}>My Room Projects</h1>
          <div style={{ fontSize: 11, color: "#7c8a99", fontFamily: "Consolas, 'IBM Plex Mono', monospace" }}>ur nook</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="New project name… e.g. Living Room"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") createProject();
          }}
          style={{ flex: 1, padding: "10px 12px", fontSize: 13.5 }}
        />
        <button
          onClick={createProject}
          disabled={creating || !newName.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "1px solid #2c5568",
            background: creating || !newName.trim() ? "#1a222c" : "#2c5568",
            color: creating || !newName.trim() ? "#7c8a99" : "#fff",
            cursor: creating || !newName.trim() ? "default" : "pointer",
            fontSize: 13.5,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {creating ? "Creating…" : "+ New Project"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(226,104,95,0.12)",
            border: "1px solid #5a2a2a",
            color: "#e2685f",
            padding: "10px 14px",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
      {loading && <p style={{ color: "#7c8a99", fontSize: 13.5 }}>Loading your projects…</p>}
      {!loading && projects.length === 0 && (
        <div
          style={{
            color: "#7c8a99",
            fontSize: 12.5,
            lineHeight: 1.6,
            padding: 16,
            background: "#1a222c",
            border: "1px dashed #232d38",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          No projects yet — create one above to get started.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {projects.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #232d38",
              borderRadius: 10,
              padding: 14,
              background: "#141a22",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onClick={() => {
              window.location.href = `/designer.html?project=${p.id}`;
            }}
          >
            <div
              style={{
                height: 100,
                background: "#0d1117",
                border: "1px solid #232d38",
                borderRadius: 6,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {p.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnail} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#7c8a99", fontSize: 11 }}>No preview yet</span>
              )}
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4, color: "#fff", fontSize: 13.5 }}>{p.name}</div>
            <div
              style={{
                fontSize: 10.5,
                color: "#7c8a99",
                marginBottom: 10,
                fontFamily: "Consolas, 'IBM Plex Mono', monospace",
              }}
            >
              Updated {new Date(p.updatedAt).toLocaleString()}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <a
                href={`/designer.html?project=${p.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "8px 0",
                  borderRadius: 6,
                  border: "1px solid #5fc9e8",
                  background: "#2c5568",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Open
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(p.id);
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 6,
                  border: "1px solid #5a2a2a",
                  background: "transparent",
                  color: "#e2685f",
                  cursor: "pointer",
                  fontSize: 12.5,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
