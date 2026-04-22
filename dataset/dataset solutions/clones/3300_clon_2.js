function ProcessInputData(rawData) {
  // Split the entire input string into an array of lines
  rawData = rawData.split("\n");

  // The first line contains the number of items/days
  const numItems = parseInt(rawData[0], 10);

  // Helper function to safely convert a string to an integer
  const convertStringToNumber = (strValue) => {
    return parseInt(strValue, 10);
  };

  // Array to store the costs/values for each activity per day
  const itemCosts = [];

  // Loop through the remaining lines to populate the activity costs
  for (let idx = 0; idx < numItems; idx++) {
    // Each line (after the first) represents costs for activities A, B, C for a day
    // Split by space and convert each part to an integer
    itemCosts.push(rawData[idx + 1].split(' ').map(convertStringToNumber));
  }

  // Calculate and log the maximum possible value using dynamic programming
  console.log(calculateMaxHappiness(numItems, itemCosts));
}

// Invoke the main processing function with data read from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Calculates the maximum happiness achievable using dynamic programming.
 * This function solves a variation of the "vacation problem" or "activities problem"
 * where you have N days and on each day you can choose one of three activities (A, B, C),
 * but you cannot choose the same activity on two consecutive days.
 *
 * @param {number} totalElements - The total number of days/items.
 * @param {number[][]} activityValues - A 2D array where activityValues[i][j]
 *                                      is the happiness gained on day 'i' by choosing activity 'j'.
 * @returns {number} The maximum total happiness.
 */
function calculateMaxHappiness(totalElements, activityValues) {
  // Initialize a 2D DP table.
  // dynamicProgrammingTable[i][j] will store the maximum happiness up to day 'i'
  // by choosing activity 'j' on day 'i'.
  const dynamicProgrammingTable = Array(totalElements)
                                    .fill(0)
                                    .map(element => {
                                      return Array(3).fill(0);
                                    });

  // Base case: For the first day (day 0), the maximum happiness is simply
  // the happiness gained from choosing each activity on that day.
  dynamicProgrammingTable[0] = [...activityValues[0]];

  // Iterate through each day starting from the second day (day 1)
  for (let rowIdx = 1; rowIdx < totalElements; rowIdx++) {
    // Iterate through each possible activity for the current day (currentActivity: 0, 1, 2 for A, B, C)
    for (let currentActivity = 0; currentActivity < 3; currentActivity++) {
      // Iterate through each possible activity for the previous day (prevActivity: 0, 1, 2 for A, B, C)
      for (let prevActivity = 0; prevActivity < 3; prevActivity++) {
          // Constraint: Cannot choose the same activity on consecutive days
          if (currentActivity === prevActivity) {
              continue; // Skip if the activities are the same
          }

          // Calculate the happiness for the current state:
          // Happiness on current day (activityValues[rowIdx][currentActivity])
          // + Max happiness from previous day (dynamicProgrammingTable[rowIdx - 1][prevActivity])
          // Update the DP table with the maximum happiness found so far for this state
          dynamicProgrammingTable[rowIdx][currentActivity] = Math.max(
              dynamicProgrammingTable[rowIdx][currentActivity],
              activityValues[rowIdx][currentActivity] + dynamicProgrammingTable[rowIdx - 1][prevActivity]
          );
      }
    }
  }

  // After filling the entire DP table, the maximum happiness will be the maximum value
  // in the last row of the table (representing the last day).
  return Math.max(...dynamicProgrammingTable[totalElements - 1]);
}