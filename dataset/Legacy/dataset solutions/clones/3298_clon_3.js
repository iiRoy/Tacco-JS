'use strict';
(function(rawData){
  const parseActivityLine = (activityLineString) => {
    return activityLineString.split(/\s+/).map(activityScore => activityScore - 0);
  };

  const trimmedInput = rawData.trim();
  const lineSegments = trimmedInput.split(/\n/);
  const parsedActivityData = lineSegments.map(parseActivityLine);

  const numberOfDays = parsedActivityData[0][0];

  const dailyMaxHappiness = new Array(numberOfDays + 1);
  dailyMaxHappiness[0] = [0, 0, 0]; // Initialize base case for day 0 with 0 happiness

  for (let currentDayIndex = 1; currentDayIndex <= numberOfDays; currentDayIndex++) {
    dailyMaxHappiness[currentDayIndex] = [0, 0, 0]; // Initialize current day's happiness values

    const currentDayActivities = parsedActivityData[currentDayIndex];
    const previousDayHappinessValues = dailyMaxHappiness[currentDayIndex - 1];

    for (let activityTypeIndex = 0; activityTypeIndex < 3; activityTypeIndex++) {
      const happinessGainedToday = currentDayActivities[activityTypeIndex];

      let happinessFromPrevActivity1;
      let happinessFromPrevActivity2;

      // Determine which activities could have been done on the previous day
      // to avoid doing the same activity two days in a row.
      if (activityTypeIndex === 0) { // If current activity is type 0
        happinessFromPrevActivity1 = previousDayHappinessValues[1]; // Previous could be type 1
        happinessFromPrevActivity2 = previousDayHappinessValues[2]; // Previous could be type 2
      } else if (activityTypeIndex === 1) { // If current activity is type 1
        happinessFromPrevActivity1 = previousDayHappinessValues[0]; // Previous could be type 0
        happinessFromPrevActivity2 = previousDayHappinessValues[2]; // Previous could be type 2
      } else { // If current activity is type 2
        happinessFromPrevActivity1 = previousDayHappinessValues[0]; // Previous could be type 0
        happinessFromPrevActivity2 = previousDayHappinessValues[1]; // Previous could be type 1
      }

      const maxHappinessFromPreviousDay = Math.max(happinessFromPrevActivity1, happinessFromPrevActivity2);

      dailyMaxHappiness[currentDayIndex][activityTypeIndex] =
        maxHappinessFromPreviousDay + happinessGainedToday;
    }
  }

  const finalMaximumHappiness = Math.max(...dailyMaxHappiness[numberOfDays]);

  console.log(finalMaximumHappiness);
})(require('fs').readFileSync('/dev/stdin','utf8'));
