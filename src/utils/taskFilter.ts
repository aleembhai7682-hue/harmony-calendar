import { CalendarTask, CalendarFaithMode } from '../types/calendar';

/**
 * Checks whether a given task should be visible in the current mode.
 * Strict segregation:
 * - Muslim Mode: Shows only Muslim and Universal tasks (hides Hindu & Christian specific tasks)
 * - Hindu Mode: Shows only Hindu and Universal tasks (hides Muslim & Christian specific tasks)
 * - Christian Mode: Shows only Christian and Universal tasks (hides Muslim & Hindu specific tasks)
 */
export function isTaskVisibleInMode(
  task: CalendarTask,
  mode?: CalendarFaithMode
): boolean {
  if (!mode) return true;
  const tag = task.faithTag;
  if (!tag || tag === 'universal') return true;

  if (mode === 'muslim') {
    return tag === 'muslim';
  }
  if (mode === 'hindu') {
    return tag === 'hindu';
  }
  if (mode === 'christian') {
    return tag === 'christian';
  }
  return true;
}

/**
 * Filters a list of tasks for the active mode.
 */
export function filterTasksByMode(
  tasks: CalendarTask[],
  mode?: CalendarFaithMode
): CalendarTask[] {
  if (!mode) return tasks;
  return tasks.filter((task) => isTaskVisibleInMode(task, mode));
}
