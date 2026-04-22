function orchestrateSolution(rawDataStr) {
  // Ensure the input string is not empty or null
  if (!rawDataStr || rawDataStr.trim().length === 0) {
    console.error("Input data is empty. Cannot proceed.");
    return;
  }

  // Split the raw string into individual lines
  const inputLines = rawDataStr.split("\n");

  // A helper function to safely convert string to integer
  const stringToIntegerMapper = (textValue) => {
    const parsed = parseInt(textValue, 10);
    // Return 0 if parsing fails or results in NaN, to handle potential bad input gracefully
    return isNaN(parsed) ? 0 : parsed;
  };

  // Extract the number of periods (N) from the first line
  // Use a default of 0 if the first line is invalid
  const totalPeriods = stringToIntegerMapper(inputLines[0]);

  // Validate the number of periods
  if (totalPeriods <= 0) {
    console.error("Number of periods must be a positive integer.");
    return;
  }

  // Initialize a matrix to store daily benefit values for each activity
  const dailyBenefitMatrix = [];
  // Populate the daily benefit matrix from the input lines
  // Starting from the second line (index 1) up to totalPeriods lines
  for (let dayIndex = 0; dayIndex < totalPeriods; dayIndex++) {
    const currentLine = inputLines[dayIndex + 1]; // Get the line for the current day
    if (!currentLine) {
      // Handle cases where there are not enough data lines for all periods
      console.warn(`Missing data for day ${dayIndex + 1}. Filling with zeros.`);
      dailyBenefitMatrix.push([0, 0, 0]);
      continue;
    }
    // Split the line by space and map each part to an integer
    dailyBenefitMatrix.push(currentLine.split(' ').map(stringToIntegerMapper));
  }

  // Call the dynamic programming routine and print the maximum achievable value
  const finalResult = determineOptimalPathValue(totalPeriods, dailyBenefitMatrix);
  console.log(finalResult);
}

/**
 * Calculates the maximum total value achievable over a series of periods
 * by choosing one of three activities each day, with the constraint that
 * the same activity cannot be chosen on consecutive days.
 *
 * @param {number} periodCount The total number of periods (days).
 * @param {number[][]} dailyValues A 2D array where dailyValues[i][j]
 *                                 is the benefit of performing activity j on day i.
 * @returns {number} The maximum total value.
 */
function determineOptimalPathValue(periodCount, dailyValues) {
  // Initialize a memoization table (DP table)
  // memoTable[i][j] will store the maximum value achievable up to period i,
  // ending with activity j on period i.
  const memoTable = new Array(periodCount).fill(null).map(() => new Array(3).fill(0));

  // Base case: For the first period (day 0), the maximum value for each activity
  // is simply the benefit of that activity on day 0.
  // We use slice() to create a shallow copy to avoid reference issues.
  memoTable[0] = dailyValues[0].slice();

  // Iterate through the periods starting from the second period (day 1)
  for (let currentPeriodIndex = 1; currentPeriodIndex < periodCount; currentPeriodIndex++) {
    // Retrieve the benefits for the current day's activities
    const currentDayBenefits = dailyValues[currentPeriodIndex];

    // Calculate max values for ending with Activity 0 on the current day
    // This means the previous day's activity must have been Activity 1 or Activity 2.
    const option1PrevAct1 = memoTable[currentPeriodIndex - 1][1];
    const option2PrevAct2 = memoTable[currentPeriodIndex - 1][2];
    memoTable[currentPeriodIndex][0] = currentDayBenefits[0] + Math.max(option1PrevAct1, option2PrevAct2);

    // Calculate max values for ending with Activity 1 on the current day
    // This means the previous day's activity must have been Activity 0 or Activity 2.
    const option3PrevAct0 = memoTable[currentPeriodIndex - 1][0];
    const option4PrevAct2 = memoTable[currentPeriodIndex - 1][2];
    memoTable[currentPeriodIndex][1] = currentDayBenefits[1] + Math.max(option3PrevAct0, option4PrevAct2);

    // Calculate max values for ending with Activity 2 on the current day
    // This means the previous day's activity must have been Activity 0 or Activity 1.
    const option5PrevAct0 = memoTable[currentPeriodIndex - 1][0];
    const option6PrevAct1 = memoTable[currentPeriodIndex - 1][1];
    memoTable[currentPeriodIndex][2] = currentDayBenefits[2] + Math.max(option5PrevAct0, option6PrevAct1);
  }

  // After processing all periods, the maximum total value will be the
  // maximum among the values in the last row of the memoization table.
  let overallMaxValue = 0;
  const lastPeriodValues = memoTable[periodCount - 1];
  for (let activityType = 0; activityType < 3; activityType++) {
    if (lastPeriodValues[activityType] > overallMaxValue) {
      overallMaxValue = lastPeriodValues[activityType];
    }
  }

  return overallMaxValue;
}

// Entry point for execution: Read input from standard input and pass to the orchestrator.
orchestrateSolution(require("fs").readFileSync("/dev/stdin", "utf8"));