import { useState, useEffect } from "react";

const SUPABASE_URL = "https://zwdixbqnrvjpirjeurdg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZGl4YnFucnZqcGlyamV1cmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjMxMDYsImV4cCI6MjA5MDgzOTEwNn0.zKxLimgp9Y-fyg2nKjqh-jSPLaRhr-GnEGdRkShfmuU ";

const fetchSignups = async (url, key) => {
  const res = await fetch(
    `${url}/rest/v1/beta_applications?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const updateStatus = async (url, key, id, status) => {
  const res = await fetch(`${url}/rest/v1/beta_applications?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
};

export default function HushAdmin() {
  const [url, setUrl] = useState(SUPABASE_URL);
  const [key, setKey] = useState(SUPABASE_ANON_KEY);
  const [connected, setConnected] = useState(false);
  const [signups, setSignups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const connect = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSignups(url, key);
      setSignups(data);
      setFiltered(data);
      setConnected(true);
    } catch {
      setError("Could not connect. Check your Supabase URL and key.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!connected) return;
    let result = [...signups];
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, signups, connected]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateStatus(url, key, id, status);
      setSignups((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch {
      alert("Failed to update status.");
    }
    setUpdating(null);
  };

  const stats = {
    total: signups.length,
    pending: signups.filter((s) => s.status === "pending").length,
    approved: signups.filter((s) => s.status === "approved").length,
    rejected: signups.filter((s) => s.status === "rejected").length,
  };

  const statusColor = (s) => {
    if (s === "approved") return "#00e5a0";
    if (s === "rejected") return "#ff4466";
    return "#c9a84c";
  };

  if (!connected) {
    return (
      <div style={styles.root}>
        <div style={styles.loginCard}>
          <div style={styles.logoRow}>
            <span style={styles.logoText}>HUSH</span>
            <span style={styles.logoSub}>ADMIN</span>
          </div>
          <p style={styles.loginHint}>Enter your Supabase credentials to view signups.</p>
          <input
            style={styles.input}
            placeholder="Supabase Project URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Supabase Anon Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            type="password"
          />
          {error && <p style={styles.errorText}>{error}</p>}
          <button style={styles.connectBtn} onClick={connect} disabled={loading}>
            {loading ? "Connecting..." : "Enter →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div>
          <span style={styles.logoText}>HUSH</span>
          <span style={styles.logoSub}>ADMIN</span>
        </div>
        <span style={styles.liveTag}>● LIVE</span>
      </header>

      <div style={styles.statsRow}>
        {[
          { label: "TOTAL", value: stats.total, color: "#c9a84c" },
          { label: "PENDING", value: stats.pending, color: "#c9a84c" },
          { label: "APPROVED", value: stats.approved, color: "#00e5a0" },
          { label: "REJECTED", value: stats.rejected, color: "#ff4466" },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <span style={{ ...styles.statNum, color: s.color }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.searchInput}
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={styles.filterRow}>
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              style={{
                ...styles.filterBtn,
                ...(statusFilter === f ? styles.filterBtnActive : {}),
              }}
              onClick={() => setStatusFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["NAME", "EMAIL", "18+", "STATUS", "JOINED", "ACTIONS"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyCell}>No signups found.</td>
              </tr>
            ) : (
              filtered.map((s, i) => (
                <tr
                  key={s.id}
                  style={{
                    ...styles.tr,
                    backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  }}
                >
                  <td style={styles.td}>{s.name || "—"}</td>
                  <td style={{ ...styles.td, color: "#aaa", fontSize: 13 }}>{s.email}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {s.is_18 ? <span style={{ color: "#00e5a0" }}>✓</span> : <span style={{ color: "#ff4466" }}>✗</span>}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: statusColor(s.status) + "22", color: statusColor(s.status), border: `1px solid ${statusColor(s.status)}44` }}>
                      {s.status || "pending"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: "#666", fontSize: 12 }}>
                    {s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button
                        style={{ ...styles.actionBtn, color: "#00e5a0", borderColor: "#00e5a044" }}
                        onClick={() => handleStatus(s.id, "approved")}
                        disabled={updating === s.id || s.status === "approved"}
                      >
                        ✓
                      </button>
                      <button
                        style={{ ...styles.actionBtn, color: "#ff4466", borderColor: "#ff446644" }}
                        onClick={() => handleStatus(s.id, "rejected")}
                        disabled={updating === s.id || s.status === "rejected"}
                      >
                        ✗
                      </button>
                      <button
                        style={{ ...styles.actionBtn, color: "#c9a84c", borderColor: "#c9a84c44" }}
                        onClick={() => handleStatus(s.id, "pending")}
                        disabled={updating === s.id || s.status === "pending"}
                      >
                        ↩
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        {filtered.length} of {signups.length} applicants shown
        <button style={styles.refreshBtn} onClick={connect}>↻ Refresh</button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#080808",
    color: "#e8e8e8",
    fontFamily: "'Courier New', monospace",
    padding: "0 0 40px",
  },
  loginCard: {
    maxWidth: 420,
    margin: "80px auto",
    padding: 40,
    border: "1px solid #222",
    backgroundColor: "#0d0d0d",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  logoRow: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 },
  logoText: { fontSize: 32, fontWeight: 700, letterSpacing: 8, color: "#c9a84c" },
  logoSub: { fontSize: 11, letterSpacing: 4, color: "#555" },
  loginHint: { fontSize: 12, color: "#555", margin: 0 },
  input: {
    background: "#111",
    border: "1px solid #222",
    color: "#e8e8e8",
    padding: "12px 16px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errorText: { color: "#ff4466", fontSize: 12, margin: 0 },
  connectBtn: {
    background: "#c9a84c",
    color: "#000",
    border: "none",
    padding: "14px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 3,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    borderBottom: "1px solid #1a1a1a",
  },
  liveTag: { fontSize: 11, color: "#00e5a0", letterSpacing: 3 },
  statsRow: {
    display: "flex",
    gap: 1,
    padding: "24px 32px",
    borderBottom: "1px solid #1a1a1a",
  },
  statCard: {
    flex: 1,
    padding: "20px 24px",
    backgroundColor: "#0d0d0d",
    border: "1px solid #1a1a1a",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statNum: { fontSize: 36, fontWeight: 700, letterSpacing: -1 },
  statLabel: { fontSize: 10, letterSpacing: 4, color: "#444" },
  toolbar: {
    display: "flex",
    gap: 16,
    padding: "20px 32px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    background: "#0d0d0d",
    border: "1px solid #222",
    color: "#e8e8e8",
    padding: "10px 16px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    width: 260,
  },
  filterRow: { display: "flex", gap: 4 },
  filterBtn: {
    background: "transparent",
    border: "1px solid #222",
    color: "#555",
    padding: "8px 16px",
    fontSize: 10,
    letterSpacing: 2,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  filterBtnActive: {
    borderColor: "#c9a84c",
    color: "#c9a84c",
  },
  tableWrap: { padding: "0 32px", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#444",
    textAlign: "left",
    padding: "12px 16px",
    borderBottom: "1px solid #1a1a1a",
  },
  tr: { transition: "background 0.15s" },
  td: { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #111" },
  emptyCell: { padding: 40, textAlign: "center", color: "#333", fontSize: 13 },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    fontSize: 10,
    letterSpacing: 2,
    borderRadius: 2,
  },
  actionRow: { display: "flex", gap: 6 },
  actionBtn: {
    background: "transparent",
    border: "1px solid",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    opacity: 0.8,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    fontSize: 11,
    color: "#333",
    letterSpacing: 2,
    borderTop: "1px solid #1a1a1a",
    marginTop: 16,
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid #222",
    color: "#555",
    padding: "6px 14px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 2,
  },
};
