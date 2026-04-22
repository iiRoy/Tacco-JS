"use strict";

/**
 * Main entry point for the solution logic.
 * Reads input, processes it, and prints the result.
 */
function solutionEntry() {
  // Define a constant for the cost multiplier for combining segments.
  const COMBINATION_COST_PER_SEGMENT = 10;

  // Read raw input data from stdin.
  const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

  // Helper to convert a string or array of strings into an array of integers.
  const parseIntegers = (inputStrOrArr) => {
    let numericStrings;
    if (Array.isArray(inputStrOrArr)) {
      numericStrings = inputStrOrArr;
    } else {
      // Split by one or more whitespace characters and filter out empty strings.
      numericStrings = inputStrOrArr.split(/\s+/).filter(s => s.length > 0);
    }
    return numericStrings.map(numStr => Number.parseInt(numStr, 10));
  };

  // Function to calculate the cost for a given list of segment lengths.
  // This includes a combination penalty and a length difference penalty.
  const calculateSegmentCost = (segmentList, desiredLength) => {
    // If the list is empty, it's an invalid group, return a very high cost.
    if (segmentList.length === 0) {
      return Number.MAX_SAFE_INTEGER; // Or some other indicator of invalidity
    }

    // Calculate the cost for combining segments: (number of segments - 1) * COMBINATION_COST_PER_SEGMENT.
    // Use Math.max to ensure cost is 0 if there's only one segment.
    const combinePenalty = Math.max(0, segmentList.length - 1) * COMBINATION_COST_PER_SEGMENT;

    // Sum up the lengths of all segments in the list.
    const currentLengthSum = segmentList.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Calculate the penalty for the difference from the desired length.
    const lengthDifferencePenalty = Math.abs(currentLengthSum - desiredLength);

    // Total cost for this group.
    return combinePenalty + lengthDifferencePenalty;
  };

  // Process the input lines.
  const inputLines = rawInputData.trim().split("\n");

  // Validate that there's at least one line of input.
  if (inputLines.length === 0) {
    console.error("Error: No input provided.");
    return;
  }

  // Parse the first line containing N, A, B, C.
  const initialParams = parseIntegers(inputLines[0]);
  const numSegments = initialParams[0]; // N
  const targetA = initialParams[1];    // A
  const targetB = initialParams[2];    // B
  const targetC = initialParams[3];    // C

  // Extract the segment measurements from the subsequent lines.
  // We take 'numSegments' lines starting from the second line (index 1).
  const segmentMeasurements = parseIntegers(inputLines.slice(1, 1 + numSegments));

  // Initialize the minimum total cost found so far to a very large number.
  let minimumTotalCost = Number.MAX_SAFE_INTEGER;

  // Calculate the total number of possible assignment patterns.
  // Each segment can be assigned to group A, B, C, or left unassigned.
  // So there are 4 choices for each of N segments.
  const totalAssignmentPatterns = Math.pow(4, numSegments);

  // Iterate through all possible assignment patterns.
  // Each 'patternIndex' represents a unique way to assign segments to groups.
  for (let patternIndex = 0; patternIndex < totalAssignmentPatterns; patternIndex++) {
    let currentPattern = patternIndex; // Use a mutable copy for bitwise operations.

    // Initialize arrays to hold segments for each group.
    const groupAlpha = [];
    const groupBeta = [];
    const groupGamma = [];
    const unassignedSegments = []; // Optional: can be used for debugging or further processing

    // Iterate through each segment measurement.
    for (let segmentIdx = 0; segmentIdx < numSegments; segmentIdx++) {
      // Determine the assignment for the current segment based on the pattern.
      // The last two bits (modulo 4) of 'currentPattern' indicate the group.
      const assignmentChoice = currentPattern % 4;

      // Assign the segment to the corresponding group.
      switch (assignmentChoice) {
        case 1: // Assign to group A
          groupAlpha.push(segmentMeasurements[segmentIdx]);
          break;
        case 2: // Assign to group B
          groupBeta.push(segmentMeasurements[segmentIdx]);
          break;
        case 3: // Assign to group C
          groupGamma.push(segmentMeasurements[segmentIdx]);
          break;
        case 0: // Leave unassigned
        default:
          unassignedSegments.push(segmentMeasurements[segmentIdx]);
          break;
      }

      // Shift the pattern to the right by 2 bits (equivalent to dividing by 4)
      // to prepare for the next segment's assignment.
      currentPattern = Math.floor(currentPattern / 4);
    }

    // Check if all three target groups (A, B, C) have at least one segment assigned.
    // If any group is empty, this pattern is invalid for forming all three target bamboos.
    if (groupAlpha.length === 0 || groupBeta.length === 0 || groupGamma.length === 0) {
      continue; // Skip to the next pattern.
    }

    // Calculate the total cost for the current valid assignment pattern.
    const costForAlpha = calculateSegmentCost(groupAlpha, targetA);
    const costForBeta = calculateSegmentCost(groupBeta, targetB);
    const costForGamma = calculateSegmentCost(groupGamma, targetC);

    // Sum up the costs for all three groups.
    const currentPatternTotalCost = costForAlpha + costForBeta + costForGamma;

    // Update the minimum total cost if the current pattern yields a lower cost.
    if (currentPatternTotalCost < minimumTotalCost) {
      minimumTotalCost = currentPatternTotalCost;
    }
  }

  // Output the final minimum total cost.
  console.log(minimumTotalCost);
}

// Execute the solution.
solutionEntry();