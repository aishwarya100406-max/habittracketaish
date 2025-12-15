// client/src/utils/utils.js

export const isHabitDue = (habit, date) => {
  if (!habit || !habit.freq) return false;
  const mode = (habit.freq.mode || "").toLowerCase();

  switch (mode) {
    case "daily":
      return true;
    case "weekly":
    case "custom":
      return Array.isArray(habit.freq.days) && habit.freq.days.includes(date.getDay());
    default:
      return false;
  }
}

export const formatDate = (input) => {
  // Accepts Date or ISO-like string, returns YYYY-MM-DD
  if (!input) return null;
  if (typeof input === "string") {
    // if a full ISO string or 'YYYY-MM-DD' passed
    return input.split("T")[0];
  }
  if (input instanceof Date) {
    return input.toISOString().split("T")[0];
  }
  try {
    const d = new Date(input);
    return d.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/**
 * Check if all prerequisites for `habit` are fulfilled on `date`.
 * By default this checks same-day completions (A completed the same date as B's date).
 * @param {object} habit - habit to check (may have .prerequisites: [ids])
 * @param {Array} habits - array of all habit objects
 * @param {Date} date - Date object
 * @returns {boolean}
 */
export const isPrerequisitesMet = (habit, habits, date) => {
  if (!habit || !Array.isArray(habit.prerequisites) || habit.prerequisites.length === 0) return true;
  const dateStr = formatDate(date);
  for (const pid of habit.prerequisites) {
    const phab = habits.find(h => h.id === pid);
    if (!phab) return false; // prereq missing => treat as unmet
    if (!Array.isArray(phab.progress) || !phab.progress.includes(dateStr)) {
      return false;
    }
  }
  return true;
};

/**
 * Detects whether adding `candidatePrereqs` to node `candidateId` would create a cycle
 * in a graph where edges go from habit -> prerequisites (i.e., dependency edges).
 * @param {number|string} candidateId
 * @param {Array<number|string>} candidatePrereqs
 * @param {Array} habits
 * @returns {boolean} true if a cycle would exist
 */
export const detectCycle = (candidateId, candidatePrereqs = [], habits = []) => {
  // Build adjacency list: node -> [prereqIds]
  const adj = {};
  habits.forEach(h => {
    adj[h.id] = Array.isArray(h.prerequisites) ? [...h.prerequisites] : [];
  });
  adj[candidateId] = [...candidatePrereqs];

  const visited = new Set();
  const recStack = new Set();

  const dfs = (node) => {
    if (!adj[node]) return false;
    if (!visited.has(node)) {
      visited.add(node);
      recStack.add(node);

      for (const neigh of adj[node]) {
        if (!visited.has(neigh) && dfs(neigh)) return true;
        else if (recStack.has(neigh)) return true;
      }
    }
    recStack.delete(node);
    return false;
  };

  // Check all nodes for cycle
  const nodes = Object.keys(adj);
  for (const n of nodes) {
    if (!visited.has(n) && dfs(n)) return true;
  }
  return false;
};