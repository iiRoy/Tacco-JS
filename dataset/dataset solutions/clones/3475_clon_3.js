/**
 * @file This module provides utilities for processing numerical sequences to find maximum differences.
 * It simulates a game-like strategy for arranging numbers to maximize the sum of absolute differences
 * between adjacent elements.
 */

/**
 * Safely parses a string into an integer.
 * Adds explicit radix for robustness and handles non-numeric input by returning 0.
 *
 * @param {string} numericText The string value to convert.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function parseNumericString (numericText) {
  const parsedValue = parseInt(numericText, 10);
  // Ensure the result is a number, otherwise default to 0 to prevent NaN propagation.
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Calculates the sum of absolute differences between consecutive elements in a numeric series.
 * For example, for [1, 5, 2], it calculates |1-5| + |5-2| = 4 + 3 = 7.
 *
 * @param {number[]} numericSeries An array of numbers.
 * @returns {number} The total sum of absolute differences, or 0 if the array has less than 2 elements.
 */
function sumConsecutiveAbsoluteDifferences (numericSeries) {
  // Guard clause for invalid or insufficient input.
  if (!Array.isArray(numericSeries) || numericSeries.length < 2) {
    return 0; // No differences can be calculated for arrays with less than two elements.
  }

  let totalAbsDifference = 0; // Accumulator for the differences.
  // Iterate through the array, comparing each element with its immediate successor.
  for (let currentIndex = 0; currentIndex < numericSeries.length - 1; currentIndex++) {
    const currentElement = numericSeries[currentIndex];
    const nextElement = numericSeries[currentIndex + 1];
    totalAbsDifference += Math.abs(currentElement - nextElement);
  }
  return totalAbsDifference;
}

/**
 * Constructs an optimal sequence of numbers by strategically picking elements from a sorted source list.
 * The strategy alternates between 'min' and 'max' turns, where 'min' prioritizes picking from the start
 * of the source list and 'max' from the end. In each turn, it attempts to place two elements from the
 * source into the constructed sequence, aiming to maximize the difference between its ends.
 *
 * @param {'min'|'max'} initialStrategy The starting strategy ('min' to pick from the smallest available, 'max' from the largest).
 * @param {number[]} sourceElements A sorted array of numbers from which to pick.
 * @param {number} desiredLength The target length of the constructed sequence.
 * @returns {number[]} The strategically arranged sequence of numbers.
 */
function constructOptimalSequence (initialStrategy, sourceElements, desiredLength) {
  // Determine if the current turn's strategy is to pick from the 'min' end of available elements.
  let isPickingFromMinEnd = (initialStrategy === 'min');

  // Create a mutable copy of the source elements to prevent modifying the original array.
  const availableElements = [...sourceElements];

  // Initialize the sequence that will be built.
  const constructedSequence = [];

  // Guard clause: Handle invalid or impossible desired lengths.
  if (desiredLength <= 0 || !Array.isArray(availableElements) || availableElements.length < desiredLength) {
    console.warn("Invalid input for sequence construction: desiredLength must be positive and sourceElements sufficient.");
    return []; // Return an empty array for invalid scenarios.
  }

  // Step 1: Place the very first element into the sequence.
  // This initial placement consumes one element from the chosen end of availableElements.
  if (isPickingFromMinEnd) {
    constructedSequence.push(availableElements.shift()); // Take from the start (min value)
  } else {
    constructedSequence.push(availableElements.pop());  // Take from the end (max value)
  }
  // Toggle the strategy for the next round of placements.
  isPickingFromMinEnd = !isPickingFromMinEnd;

  // Step 2: Continue placing elements until the constructed sequence reaches the desired length.
  // Each 'turn' within this loop attempts to place two elements from the remaining available pool.
  while (constructedSequence.length < desiredLength) {
    let currentCandidate; // The element currently being considered from availableElements.
    let getNextElementFromSource; // A function to retrieve and remove the next element based on strategy.

    // Define how to get the next candidate and the removal operation based on the current turn's strategy.
    if (isPickingFromMinEnd) {
      currentCandidate = availableElements[0]; // Candidate is the smallest available element.
      getNextElementFromSource = () => availableElements.shift(); // Function to remove and return it.
    } else {
      currentCandidate = availableElements[availableElements.length - 1]; // Candidate is the largest available element.
      getNextElementFromSource = () => availableElements.pop(); // Function to remove and return it.
    }

    // Calculate the absolute differences if the current candidate were placed at either end of the
    // already constructed sequence.
    const diffIfPlacedAtFront = Math.abs(constructedSequence[0] - currentCandidate);
    const diffIfPlacedAtBack = Math.abs(constructedSequence[constructedSequence.length - 1] - currentCandidate);

    // Decision logic: place the current candidate where it creates a *larger* difference with the
    // adjacent element in the constructed sequence. This aims to maximize overall differences.
    if (diffIfPlacedAtFront > diffIfPlacedAtBack) {
      // Place the candidate at the front of the constructed sequence.
      constructedSequence.unshift(getNextElementFromSource());
      // After placing one, immediately attempt to place a second element from the *same end*
      // of availableElements if there's still room in the constructed sequence.
      if (constructedSequence.length < desiredLength) {
        constructedSequence.push(getNextElementFromSource()); // Place this second one at the back.
      }
    } else {
      // Place the candidate at the back of the constructed sequence.
      constructedSequence.push(getNextElementFromSource());
      // After placing one, immediately attempt to place a second element from the *same end*
      // of availableElements if there's still room in the constructed sequence.
      if (constructedSequence.length < desiredLength) {
        constructedSequence.unshift(getNextElementFromSource()); // Place this second one at the front.
      }
    }

    // Toggle the strategy for the next turn to alternate between 'min' and 'max' picking.
    isPickingFromMinEnd = !isPickingFromMinEnd;
  }

  return constructedSequence;
}

/**
 * Main execution function that processes input, applies strategic number arrangements,
 * and outputs the maximum sum of absolute differences found.
 *
 * @param {string} rawInputString The raw input string containing numbers.
 */
function executeMainLogic (rawInputString) {
  // Input validation: ensure the raw input is not empty or just whitespace.
  if (!rawInputString || rawInputString.trim().length === 0) {
    console.error("Error: Received empty or invalid input string.");
    return; // Exit if input is not valid.
  }

  // Split the input string by newlines and convert each part to an integer.
  // The first element is expected to be the count of subsequent numbers.
  const processedNumericData = rawInputString.split("\n").map(parseNumericString);

  // Extract the total count of elements (N) from the first line of input.
  const totalElementCount = processedNumericData[0];

  // Validate the totalElementCount. It must be a positive integer.
  if (totalElementCount <= 0 || !Number.isInteger(totalElementCount)) {
    console.error(`Error: Invalid element count specified: ${totalElementCount}. Must be a positive integer.`);
    return;
  }

  // Collect the actual numbers into an array, starting from the second line of input.
  const initialElements = [];
  // Loop from index 1 up to totalElementCount (inclusive, as processedNumericData[0] is N).
  for (let k = 1; k <= totalElementCount; k++) {
    // Add validation for each element to ensure it's a number.
    if (typeof processedNumericData[k] === 'number' && !isNaN(processedNumericData[k])) {
      initialElements.push(processedNumericData[k]);
    } else {
      console.warn(`Warning: Non-numeric value encountered at input line ${k + 1}, skipping.`);
    }
  }

  // Crucial step: Sort the collected elements in ascending order.
  // This is a prerequisite for the 'min' and 'max' picking strategies.
  initialElements.sort((a, b) => a - b);

  // Scenario 1: Start constructing the sequence by prioritizing picks from the 'min' end of sorted elements.
  // A new array copy `[...initialElements]` is passed to avoid modifying the original sorted list.
  const sequenceFromMinStart = constructOptimalSequence('min', [...initialElements], totalElementCount);
  const maxDifferenceFromMinStart = sumConsecutiveAbsoluteDifferences(sequenceFromMinStart);

  // Scenario 2: Start constructing the sequence by prioritizing picks from the 'max' end of sorted elements.
  // Again, a fresh copy is used.
  const sequenceFromMaxStart = constructOptimalSequence('max', [...initialElements], totalElementCount);
  const maxDifferenceFromMaxStart = sumConsecutiveAbsoluteDifferences(sequenceFromMaxStart);

  // Determine the overall maximum difference obtained from the two strategies.
  const overallMaximumDifference = Math.max(maxDifferenceFromMinStart, maxDifferenceFromMaxStart);

  // Output the final result.
  console.log(overallMaximumDifference);
}

// Entry point for execution in a Node.js environment, reading from standard input.
// This block ensures the code runs when executed as a script.
if (typeof require !== 'undefined' && require.main === module) {
  // Use try-catch for robust file reading.
  try {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    executeMainLogic(inputContent);
  } catch (error) {
    console.error(`Failed to read input from /dev/stdin: ${error.message}`);
    // Optionally, provide a default or example input for testing.
    // executeMainLogic("5\n1\n2\n3\n4\n5");
  }
}