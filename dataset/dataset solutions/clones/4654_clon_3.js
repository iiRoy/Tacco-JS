"use strict"; // Enforce strict mode for robust code execution.

/**
 * Orchestrates the processing of contest participant data to determine
 * the maximum possible aggregate score based on specific grouping rules.
 * This function parses input, sorts strengths, and computes the sum
 * of second-strongest members from N groups.
 *
 * @param {string} rawContestData - The complete raw input string from standard input,
 *                                  expected to contain the number of groups (N) on the first line
 *                                  and a space-separated list of participant strengths on the second.
 */
function ProcessContestData(rawContestData) {
  // Defensive check: Ensure the provided input data is not empty or merely whitespace.
  if (!rawContestData || rawContestData.trim().length === 0) {
    console.error("Input data is missing or consists only of whitespace. Cannot proceed.");
    return; // Terminate execution if essential data is absent.
  }

  // Divide the raw input string into an array of individual lines.
  const inputSections = rawContestData.trim().split("\n");

  // Validate that we have at least two lines: one for N and one for strengths.
  if (inputSections.length < 2) {
    console.error("The input provided does not contain enough lines. Expected at least two.");
    return; // Exit due to insufficient input structure.
  }

  // Extract and convert the first line to determine the total number of groups (N).
  const rawGroupCountString = inputSections[0].trim();
  const numberOfGroups = Number(rawGroupCountString);

  // Perform basic validation on the parsed number of groups.
  if (isNaN(numberOfGroups) || !Number.isInteger(numberOfGroups) || numberOfGroups <= 0) {
    console.error(`Invalid or non-positive number of groups detected: '${rawGroupCountString}'. Must be a positive integer.`);
    return; // Abort if N is invalid.
  }

  // Retrieve the second line, which contains all participant strengths.
  const strengthValuesString = inputSections[1].trim();

  // Process the strength string: split into individual strings, convert to numbers,
  // and then sort them in descending order to facilitate greedy selection.
  const participantStrengthsSorted = strengthValuesString
    .split(" ") // Break the string into an array of strength strings.
    .map(currentStrengthStr => {
      // Convert each strength string to a number. Handle potential non-numeric inputs gracefully.
      const parsedStrength = Number(currentStrengthStr);
      if (isNaN(parsedStrength)) {
        // If a strength value is not a valid number, log a warning and treat it as 0.
        // Depending on requirements, this could also throw an error or filter the value.
        console.warn(`Non-numeric strength value encountered: '${currentStrengthStr}'. Treating as 0.`);
        return 0;
      }
      return parsedStrength;
    })
    .sort((strengthA, strengthB) => strengthB - strengthA); // Sort numerically in descending order.

  // Define constants for clarity and potential future modification.
  const peoplePerGroup = 3; // Each group consists of 3 individuals.
  const secondStrongestIndexOffset = 1; // In a 0-indexed sorted triplet, the second strongest is at index 1.

  // Verify that the total number of strengths matches the expected count (3 * N).
  const expectedTotalParticipants = numberOfGroups * peoplePerGroup;
  if (participantStrengthsSorted.length !== expectedTotalParticipants) {
    console.warn(`Participant count mismatch: Expected ${expectedTotalParticipants} participants for ${numberOfGroups} groups (3 per group), but found ${participantStrengthsSorted.length}. Calculation might be incomplete.`);
    // The program will continue, but this warning indicates a potential input data issue.
  }

  // Initialize a variable to accumulate the sum of the second-strongest people's strengths.
  let cumulativeGroupScore = 0;

  // Iterate `numberOfGroups` times, selecting the appropriate strength for each group.
  // The pattern for the second strongest in a descending sorted array of 3N items is:
  // index 1 (for group 0), index 4 (for group 1), index 7 (for group 2), and so on.
  // This can be generalized as (currentGroupIndex * 2) + 1.
  for (let currentGroupIndex = 0; currentGroupIndex < numberOfGroups; ++currentGroupIndex) {
    // Calculate the precise 0-based index of the second strongest person for the current group.
    const selectedStrengthArrayIndex = (currentGroupIndex * 2) + secondStrongestIndexOffset;

    // Boundary check: Ensure the calculated index is within the bounds of the sorted strengths array.
    if (selectedStrengthArrayIndex < participantStrengthsSorted.length) {
      cumulativeGroupScore += participantStrengthsSorted[selectedStrengthArrayIndex];
    } else {
      // If we attempt to access an out-of-bounds index, it implies an issue with the input
      // (e.g., not enough strengths for all N groups as expected).
      console.error(`Error: Attempted to access strength at index ${selectedStrengthArrayIndex}, which is beyond the array length (${participantStrengthsSorted.length}). Stopping calculation.`);
      break; // Exit the loop prematurely to prevent further errors.
    }
  }

  // Output the final calculated total strength to standard output.
  console.log(cumulativeGroupScore);
}

// This boilerplate code is responsible for reading the entire standard input
// and passing it to the main processing function. It should generally remain
// unchanged in competitive programming contexts.
ProcessContestData(require("fs").readFileSync("/dev/stdin", "utf8"));