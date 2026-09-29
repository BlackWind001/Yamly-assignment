import tasksFile from '../../GreenCartArtifacts/greencart-docket/tasks.json' with { type: 'json' };

export type MockAnswer = (typeof tasksFile.tasks)[number];

// Words that say nothing about which task is meant.
const STOPWORDS = new Set(['a', 'an', 'and', 'at', 'back', 'bring', 'evaluate', 'for', 'in', 'is', 'make', 'of', 'on', 'the', 'to', 'with']);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// "Saved cards" -> ["saved", "card"]: lowercase, no stopwords, plural "s" dropped.
function keywords(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((word) => word && !STOPWORDS.has(word))
    .map((word) => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word));
}

// Same query, same pick: the telemetry view looks the answer up again from the URL.
// ponytail: string hash stands in for "random"; swap for real search when there is one.
function pickForUnmatched(question: string): MockAnswer {
  let hash = 0;
  for (const ch of normalize(question)) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return tasksFile.tasks[hash % tasksFile.tasks.length];
}

// "1"–"3" pick a task by number; otherwise the task title (its question) exactly, then the most shared
// keywords with a title. Nothing matching still returns one of the tasks.
export function getMockAnswer(question: string): MockAnswer {
  const tasks = tasksFile.tasks;
  const index = Number(question);
  if (Number.isInteger(index) && index >= 1 && index <= tasks.length) {
    return tasks[index - 1];
  }

  const exact = tasks.find((task) => normalize(task.title) === normalize(question));
  if (exact) {
    return exact;
  }

  const words = new Set(keywords(question));
  let best: MockAnswer | null = null;
  let bestScore = 0;
  for (const task of tasks) {
    const score = keywords(task.title).filter((word) => words.has(word)).length;
    if (score > bestScore) {
      best = task;
      bestScore = score;
    }
  }
  return best ?? pickForUnmatched(question);
}
