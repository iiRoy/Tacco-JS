'use strict';

/**
 * Processes raw input data to calculate the maximum possible net value
 * from eating sushi on a circular conveyor belt.
 *
 * The algorithm considers four main scenarios:
 * 1. Traveling only clockwise.
 * 2. Traveling only counter-clockwise.
 * 3. Traveling clockwise, then turning around and traveling counter-clockwise.
 * 4. Traveling counter-clockwise, then turning around and traveling clockwise.
 *
 * @param {string} rawData - The input string containing N, C, and sushi data.
 */
function ProcessInput(rawData) {
  // Parse the input string into an array of numbers.
  // The first two numbers are N (number of sushi items) and C (total circumference).
  // Subsequent pairs are distance and calorie value for each sushi item.
  let parsedValues = rawData.trim().split(/\s+/).map(val => val - 0);

  // Extract N and C from the beginning of the array.
  const numItems = parsedValues.shift();
  const totalCircumference = parsedValues.shift();

  // --- Calculate values for clockwise travel ---
  // clockwiseDistances: Stores the distance to each sushi item from the start (0).
  // clockwiseCalories: Stores the cumulative calorie value up to each sushi item.
  const clockwiseDistances = [parsedValues[0]]; // Distance to the first sushi
  const clockwiseCalories = [parsedValues[1]]; // Calories from the first sushi

  // Populate arrays for subsequent sushi items.
  for (let idx = 1; idx < numItems; idx++) {
    clockwiseDistances[idx] = parsedValues[2 * idx];
    clockwiseCalories[idx] = clockwiseCalories[idx - 1] + parsedValues[2 * idx + 1];
  }

  // --- Calculate values for counter-clockwise travel ---
  // counterClockwiseDistances: Stores the distance to each sushi item from the start (0)
  //                            when traveling counter-clockwise.
  // counterClockwiseCalories: Stores the cumulative calorie value up to each sushi item
  //                             when traveling counter-clockwise.
  const counterClockwiseDistances = [totalCircumference - parsedValues[0]]; // Distance to first sushi (from C)
  const counterClockwiseCalories = [clockwiseCalories[numItems - 1]]; // Total calories if all sushi are eaten counter-clockwise

  // Populate arrays for subsequent sushi items, iterating backwards from the last sushi.
  for (let idx = numItems - 1; idx > 0; idx--) {
    counterClockwiseDistances[idx] = totalCircumference - clockwiseDistances[idx];
    counterClockwiseCalories[idx] = clockwiseCalories[numItems - 1] - clockwiseCalories[idx - 1];
  }

  // --- Calculate net values (calories - distance) for simple travel ---
  // clockwiseNetValues: Net value if traveling clockwise to each sushi item.
  // counterClockwiseNetValues: Net value if traveling counter-clockwise to each sushi item.
  const clockwiseNetValues = clockwiseCalories.map((calVal, idx) => calVal - clockwiseDistances[idx]);
  const counterClockwiseNetValues = counterClockwiseCalories.map((calVal, idx) => calVal - counterClockwiseDistances[idx]);

  // --- Calculate prefix maximums for clockwise net values ---
  // maxClockwiseNetValues: Stores the maximum net value achievable by stopping at or before the current sushi (clockwise).
  const maxClockwiseNetValues = clockwiseNetValues.map((currentNet, index, allNetValues) =>
    (currentNet < allNetValues[index - 1]) ? allNetValues[index - 1] : currentNet
  );

  // --- Calculate suffix maximums for counter-clockwise net values ---
  // maxCounterClockwiseNetValues: Stores the maximum net value achievable by stopping at or after the current sushi (counter-clockwise).
  const maxCounterClockwiseNetValues = [];
  maxCounterClockwiseNetValues[numItems - 1] = counterClockwiseNetValues[numItems - 1];
  for (let index = numItems - 2; index >= 0; index--) {
    maxCounterClockwiseNetValues[index] = Math.max(counterClockwiseNetValues[index], maxCounterClockwiseNetValues[index + 1]);
  }

  // --- Calculate net values for complex travel scenarios (turnaround) ---
  // clockwiseThenCounterClockwise: Travel clockwise to sushi 'i', then turn around and go counter-clockwise.
  //                                The 'iRmax[i+1]' part represents the best counter-clockwise return from the next point.
  const clockwiseThenCounterClockwise = clockwiseNetValues.map((cwNet, idx) => cwNet - clockwiseDistances[idx] + maxCounterClockwiseNetValues[idx + 1]);
  // Special handling for the last sushi item (N-1) as there's no 'next' sushi for counter-clockwise return.
  clockwiseThenCounterClockwise[numItems - 1] = clockwiseNetValues[numItems - 1] - clockwiseDistances[numItems - 1] + 0;

  // counterClockwiseThenClockwise: Travel counter-clockwise to sushi 'i', then turn around and go clockwise.
  //                                The 'Rmax[i-1]' part represents the best clockwise return from the previous point.
  const counterClockwiseThenClockwise = counterClockwiseNetValues.map((ccwNet, idx) => ccwNet - counterClockwiseDistances[idx] + maxClockwiseNetValues[idx - 1]);
  // Special handling for the first sushi item (0) as there's no 'previous' sushi for clockwise return.
  counterClockwiseThenClockwise[0] = -Infinity; // Initialize with negative infinity as it's not a valid path for the first element.

  // --- Combine all potential maximums and find the overall best result ---
  const finalCandidates = [
    Math.max.apply(null, maxClockwiseNetValues),
    Math.max.apply(null, maxCounterClockwiseNetValues),
    Math.max.apply(null, clockwiseThenCounterClockwise),
    Math.max.apply(null, counterClockwiseThenClockwise),
    0, // Option to eat no sushi, resulting in 0 profit.
  ];

  // Output the highest net value found across all scenarios.
  console.log(Math.max.apply(null, finalCandidates));
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
