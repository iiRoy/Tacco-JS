'use strict';

function Processor(dataString) {
  const lines = dataString
    .trim()
    .split('\n');

  const numDays = parseInt(lines[0], 10);
  const satisfactionCosts = lines[1]
    .split(' ')
    .map((item) => parseInt(item, 10));

  const dailyScores = lines
    .slice(2, 2 + numDays)
    .map((rowStr) =>
      rowStr.split(' ')
        .map((scoreStr) => parseInt(scoreStr, 10))
    );

  let lastEventDates = new Array(26).fill(0); /* Stores the latest date each event type was held */
  let currentEventScores = new Array(26).fill(0); /* Holds the satisfaction value for each event type on the current day */
  let scoreDecrements = new Array(26).fill(0); /* Represents the penalty incurred for not holding an event type */

  for (let dayIdx = 1; dayIdx <= numDays; dayIdx++) {
    for (let eventTypeIdx = 0; eventTypeIdx < satisfactionCosts.length; eventTypeIdx++) {
      scoreDecrements[eventTypeIdx] = satisfactionCosts[eventTypeIdx] * (dayIdx - lastEventDates[eventTypeIdx]) * -1;
    }

    for (let currentTypeIdx = 0; currentTypeIdx < satisfactionCosts.length; currentTypeIdx++) {
      const tempDecrements = [...scoreDecrements];
      tempDecrements[currentTypeIdx] = dailyScores[dayIdx - 1][currentTypeIdx];
      const totalScore = tempDecrements.reduce((accumulator, currentVal) => accumulator + currentVal);
      currentEventScores[currentTypeIdx] = totalScore;
      /* This line was commented out in the original, so it remains commented. */
      // currentEventScores[currentTypeIdx] += dailyScores[dayIdx - 1][currentTypeIdx] + drop - scoreDecrements[currentTypeIdx];
    }

    let bestEventType = 0;
    let highestScore = 0;

    for (let checkTypeIdx = 0; checkTypeIdx < satisfactionCosts.length; checkTypeIdx++) {
      if (highestScore < currentEventScores[checkTypeIdx]) {
        highestScore = currentEventScores[checkTypeIdx];
        bestEventType = checkTypeIdx;
      }
    }

    lastEventDates[bestEventType] = dayIdx;
    console.log(bestEventType + 1);
  }

  return;
}

Processor(require('fs').readFileSync('/dev/stdin', 'utf8'));