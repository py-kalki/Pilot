import { ISchedule, IScheduleDay } from "../../models/Kit";

export interface ScheduledQuestionItem {
  id: string;
  category: string;
}

/**
 * Stage 6: Pure deterministic function allocating questions into day-by-day study sessions
 * (NEVER calls the LLM)
 */
export function allocateSchedule(
  questionItems: ScheduledQuestionItem[],
  daysAvailable = 5
): ISchedule {
  const daysCount = Math.max(1, Math.min(30, Math.round(daysAvailable)));
  const totalQuestions = questionItems.length;

  const scheduleDays: IScheduleDay[] = [];

  if (totalQuestions === 0) {
    for (let d = 1; d <= daysCount; d++) {
      scheduleDays.push({
        day: d,
        focus: `Day ${d} Review & Practice`,
        question_ids: [],
        minutes: 45,
      });
    }
    return {
      days_available: daysCount,
      days: scheduleDays,
    };
  }

  // Distribute questions evenly across available days
  const questionsPerDay = Math.ceil(totalQuestions / daysCount);

  for (let d = 1; d <= daysCount; d++) {
    const startIdx = (d - 1) * questionsPerDay;
    const endIdx = Math.min(startIdx + questionsPerDay, totalQuestions);

    let dayQIds = questionItems.slice(startIdx, endIdx).map((q) => q.id);

    // If day has no questions because days > total questions, rotate a question for reinforcement
    if (dayQIds.length === 0 && questionItems.length > 0) {
      dayQIds = [questionItems[(d - 1) % questionItems.length].id];
    }

    // Determine focus theme based on assigned questions or day sequence
    let focus = "Core Technical Competencies & Problem Solving";
    if (d === 1) {
      focus = "Foundations, Architecture & Core Skills";
    } else if (d === daysCount) {
      focus = "Mock Interview Simulation, Behavioral & Final Revision";
    } else if (d === Math.ceil(daysCount / 2)) {
      focus = "Deep Dive Scenarios, System Design & Edge Cases";
    } else {
      focus = `Day ${d} Targeted Practice & Spaced Repetition`;
    }

    const estimatedMinutes = Math.max(30, Math.min(120, Math.round(dayQIds.length * 15 + 20)));

    scheduleDays.push({
      day: d,
      focus,
      question_ids: dayQIds,
      minutes: estimatedMinutes,
    });
  }

  return {
    days_available: daysCount,
    days: scheduleDays,
  };
}
