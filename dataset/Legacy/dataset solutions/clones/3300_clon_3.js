const parseActivityLine = (lineString, parserFunction) => {
    return lineString.split(' ').map(parserFunction);
};

function ProcessInput(rawDataContent) {
  const inputLines = rawDataContent.split("\n");
  const numberOfDays = parseInt(inputLines[0], 10);

  const parseNumericValue = (valueString) => parseInt(valueString, 10);

  const dailyActivityValues = [];
  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    dailyActivityValues.push(parseActivityLine(inputLines[dayIndex + 1], parseNumericValue));
  }
  console.log(calculateMaxHappiness(numberOfDays, dailyActivityValues));
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateMaxHappiness(numberOfDays, dailyActivityValues) {
  const happinessMemoTable = [];
  for (let row = 0; row < numberOfDays; row++) {
    happinessMemoTable.push(Array(3).fill(0));
  }

  if (numberOfDays > 0) {
      happinessMemoTable[0][0] = dailyActivityValues[0][0];
      happinessMemoTable[0][1] = dailyActivityValues[0][1];
      happinessMemoTable[0][2] = dailyActivityValues[0][2];
  }

  for (let dayIndex = 1; dayIndex < numberOfDays; dayIndex++) {
    const currentDayActivityCosts = dailyActivityValues[dayIndex];
    for (let currentActivityIndex = 0; currentActivityIndex < 3; currentActivityIndex++) {
      const costOfCurrentActivity = currentDayActivityCosts[currentActivityIndex];
      
      for (let previousActivityIndex = 0; previousActivityIndex < 3; previousActivityIndex++) {
          if (currentActivityIndex !== previousActivityIndex) {
              const happinessFromPreviousDay = happinessMemoTable[dayIndex - 1][previousActivityIndex];
              const potentialTotalHappiness = costOfCurrentActivity + happinessFromPreviousDay;
              
              if (potentialTotalHappiness > happinessMemoTable[dayIndex][currentActivityIndex]) {
                  happinessMemoTable[dayIndex][currentActivityIndex] = potentialTotalHappiness;
              }
          }
      }
    }
  }

  let finalMaxHappiness = 0;
  if (numberOfDays > 0) {
      finalMaxHappiness = happinessMemoTable[numberOfDays - 1][0];
      for (let activityOptionIndex = 1; activityOptionIndex < 3; activityOptionIndex++) {
          if (happinessMemoTable[numberOfDays - 1][activityOptionIndex] > finalMaxHappiness) {
              finalMaxHappiness = happinessMemoTable[numberOfDays - 1][activityOptionIndex];
          }
      }
  }
  return finalMaxHappiness;
}
