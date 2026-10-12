'use strict';

const processSchedule = (rawData) => {
  const inputSegments = rawData.split('\n');
  const taskCount = parseInt(inputSegments[0], 10);

  const workItems = inputSegments.slice(1, taskCount + 1).map(segment =>
    segment.split(' ').map(Number)
  );

  workItems.sort((itemA, itemB) => itemA[1] - itemB[1]);

  const initialEvaluation = { currentCompletionTime: 0, feasible: true };

  const finalEvaluation = workItems.reduce((accumulator, currentItem) => {
    if (!accumulator.feasible) {
      return accumulator;
    }
    const [duration, deadline] = currentItem;
    const newCompletionTime = accumulator.currentCompletionTime + duration;
    const stillFeasible = newCompletionTime <= deadline;

    return {
      currentCompletionTime: newCompletionTime,
      feasible: stillFeasible
    };
  }, initialEvaluation);

  const scheduleStatus = finalEvaluation.feasible ? 'Yes' : 'No';

  console.log(scheduleStatus);
};

processSchedule(require('fs').readFileSync('/dev/stdin', 'utf8'));
