'use strict';

function ProcessData(rawData)
{
  const linesArray = rawData.trim().split('\n');

  const numDays = Number(linesArray[0]);

  const penaltyCoeffs = linesArray[1].split(' ').map((valStr) => Number(valStr));

  const satisfactionMatrix = linesArray
    .slice(2, 2 + numDays)
    .map((rowStr) => rowStr.split(' ').map((cellStr) => Number(cellStr)));

  const dailyEventTypes = linesArray.slice(-1 * numDays).map((evtTypeStr) => Number(evtTypeStr));

  // Array storing the most recent occurrence day for each event category.
  let lastEventDates = Array(26).fill(0);

  // Scores for each event category on the current processing day.
  let currentEventScores = Array(26).fill(0);

  // The running total of accumulated scores.
  let cumulativeScore = 0;

  for (let currentDay = 1; currentDay <= numDays; currentDay++) {

    lastEventDates[dailyEventTypes[currentDay - 1] - 1] = currentDay;

    for (let eventTypeIndex = 0; eventTypeIndex < penaltyCoeffs.length; eventTypeIndex++) {
      if (lastEventDates[eventTypeIndex] === currentDay) {
        currentEventScores[eventTypeIndex] = satisfactionMatrix[currentDay - 1][eventTypeIndex];
      }
      else {
        currentEventScores[eventTypeIndex] = penaltyCoeffs[eventTypeIndex] * (currentDay - lastEventDates[eventTypeIndex]) * -1;
      }
    }

    cumulativeScore += currentEventScores.reduce((total, itemScore) => total + itemScore);

    console.log(String(cumulativeScore));
  }

  return;
}

ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));