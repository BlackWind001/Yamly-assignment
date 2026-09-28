import tasksFile from '../../GreenCartArtifacts/greencart-docket/tasks.json' with { type: 'json' };

export type MockAnswer = (typeof tasksFile.tasks)[number];

export function getMockAnswer(question: string): MockAnswer | null {
  const index = Number(question);
  if (!Number.isInteger(index) || index < 1 || index > tasksFile.tasks.length) {
    return null;
  }
  return tasksFile.tasks[index - 1];
}
