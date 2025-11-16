import React, { useState, useEffect, useMemo } from "react";

const STATUS_OPTIONS = [
  { id: "locked", label: "Locked" },
  { id: "tracking", label: "Tracking" },
  { id: "completed", label: "Completed" },
  { id: "mastered", label: "Mastered" },
];

const RARITY_OPTIONS = [
  { id: "common", label: "Common" },
  { id: "uncommon", label: "Uncommon" },
  { id: "rare", label: "Rare" },
  { id: "epic", label: "Epic" },
  { id: "legendary", label: "Legendary" },
  { id: "mythic", label: "Mythic" },
];

const ICON_OPTIONS = [
  "⭐",
  "🗡️",
  "🛡️",
  "🏹",
  "🧪",
  "📜",
  "⚒️",
  "🌿",
  "💎",
  "🔥",
  "🌙",
  "🎯",
];

export default function AddNodeForm({
  nodes = [],
  onAdd,
  onCancel,
  mode = "add",
  onSave,
  initialAchievement = {},
}) {
  const defaults = useMemo(
    () => ({
      title: initialAchievement.title ?? initialAchievement.name ?? initialAchievement.label ?? "",
      description: initialAchievement.description ?? "",
      parentId: initialAchievement.parentId ?? "",
      rarity: initialAchievement.rarity ?? "common",
      status: initialAchievement.status ?? "locked",
      xp: initialAchievement.xp ?? 50,
      reward: initialAchievement.reward ?? "",
      icon: initialAchievement.icon ?? "⭐",
      tags: Array.isArray(initialAchievement.tags) ? initialAchievement.tags : [],
      progressTotal:
        initialAchievement.progressTotal ?? initialAchievement.progress?.total ?? 1,
      progressCurrent:
        initialAchievement.progressCurrent ?? initialAchievement.progress?.current ?? 0,
    }),
    [initialAchievement]
  );

  const [title, setTitle] = useState(defaults.title);
  const [description, setDescription] = useState(defaults.description);
  const [parent, setParent] = useState(defaults.parentId || "");
  const [rarity, setRarity] = useState(defaults.rarity);
  const [status, setStatus] = useState(defaults.status);
  const [xp, setXp] = useState(defaults.xp);
  const [reward, setReward] = useState(defaults.reward);
  const [icon, setIcon] = useState(defaults.icon);
  const [tagsInput, setTagsInput] = useState(defaults.tags.join(", "));
  const [progressTotal, setProgressTotal] = useState(defaults.progressTotal);
  const [progressCurrent, setProgressCurrent] = useState(defaults.progressCurrent);

  useEffect(() => {
    setTitle(defaults.title);
    setDescription(defaults.description);
    setParent(defaults.parentId || "");
    setRarity(defaults.rarity);
    setStatus(defaults.status);
    setXp(defaults.xp);
    setReward(defaults.reward);
    setIcon(defaults.icon);
    setTagsInput(defaults.tags.join(", "));
    setProgressTotal(defaults.progressTotal);
    setProgressCurrent(defaults.progressCurrent);
  }, [defaults]);

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const total = Math.max(1, Number.parseInt(progressTotal, 10) || 1);
    const current = Math.min(
      total,
      Math.max(0, Number.parseInt(progressCurrent, 10) || 0)
    );
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      parentId: parent || null,
      rarity,
      status,
      xp: Number.parseInt(xp, 10) || 0,
      reward: reward.trim(),
      icon,
      tags,
      progressTotal: total,
      progressCurrent: current,
    };

    if (mode === "edit") {
      if (onSave) onSave(payload);
    } else if (onAdd) {
      onAdd(payload);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8, 11, 18, 0.65)",
        zIndex: 9999,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: "#0f172a",
          color: "#e2e8f0",
          padding: 24,
          borderRadius: 16,
          minWidth: 360,
          boxShadow: "0 18px 36px rgba(8, 11, 18, 0.45)",
          border: "2px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16, letterSpacing: 1 }}>
          {mode === "edit" ? "Forge Achievement" : "Create Achievement"}
        </h3>

        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 8,
              minHeight: 70,
              resize: "vertical",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>Parent (optional)</span>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
          >
            <option value="">— none —</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.data?.label ?? n.id}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <label style={{ flex: 1 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Rarity</span>
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
            >
              {RARITY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <label style={{ flex: 1 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>XP Reward</span>
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
            />
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Reward Text</span>
            <input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
            />
          </label>
        </div>

        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>Tags (comma separated)</span>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
          />
        </label>

        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <label style={{ flex: 1 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Steps Needed</span>
            <input
              type="number"
              min={1}
              value={progressTotal}
              onChange={(e) => setProgressTotal(e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
            />
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Steps Completed</span>
            <input
              type="number"
              min={0}
              value={progressCurrent}
              onChange={(e) => setProgressCurrent(e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, opacity: 0.85, display: "block", marginBottom: 6 }}>
            Icon
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ICON_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIcon(option)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: icon === option ? "2px solid #38bdf8" : "1px solid rgba(148,163,184,0.35)",
                  background: icon === option ? "rgba(14, 165, 233, 0.12)" : "rgba(15, 23, 42, 0.6)",
                  color: "#f8fafc",
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={{ padding: "8px 14px", borderRadius: 8 }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: "8px 14px", borderRadius: 8, background: "#22c55e", color: "#052e16" }}>
            {mode === "edit" ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}