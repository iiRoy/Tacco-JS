'use strict';

// This function processes the raw input string to find a specific partition.
const processInputData = (rawInputString) => {
  // Trim leading/trailing whitespace and split the input into an array of lines.
  let parsedLines = rawInputString.trim().split('\n');

  // The second line contains space-separated segment lengths.
  const segmentStringsArray = parsedLines[1].split(' ');

  // Convert string segments to integers.
  const numericSegments = segmentStringsArray.map(segmentStr => parseInt(segmentStr, 10));

  // Calculate the total length of all segments.
  const totalSumOfSegments = numericSegments.reduce((currentTotal, segmentValue) => currentTotal + segmentValue);

  // Determine the target value for half the total length.
  const targetMidpoint = totalSumOfSegments / 2;

  // Initialize variables for finding the split point.
  let accumulatedValue = 0;
  let segmentIdx = 0;

  // Iterate through segments, accumulating their values until the target midpoint is reached or exceeded.
  while (accumulatedValue < targetMidpoint) {
    accumulatedValue += numericSegments[segmentIdx];
    segmentIdx++;
  }

  // Initialize two potential answer variables.
  let firstCandidateResult = 0;
  let secondCandidateResult = 0;

  // Calculate the sum of segments up to the 'segmentIdx' (exclusive).
  for (let loopIdxA = 0; loopIdxA < segmentIdx; loopIdxA++) {
    firstCandidateResult += numericSegments[loopIdxA];
  }

  // Calculate the sum of segments up to the 'segmentIdx' (inclusive).
  for (let loopIdxB = 0; loopIdxB <= segmentIdx; loopIdxB++) {
    secondCandidateResult += numericSegments[loopIdxB];
  }

  // Adjust the first candidate result based on specific conditions.
  if (firstCandidateResult === accumulatedValue && totalSumOfSegments - firstCandidateResult === accumulatedValue) {
    firstCandidateResult = 0; // Special case: if both halves are exactly equal to accumulatedValue
  } else {
    firstCandidateResult = Math.abs(firstCandidateResult - totalSumOfSegments);
  }

  // Adjust the second candidate result based on specific conditions.
  if (secondCandidateResult === totalSumOfSegments) {
    secondCandidateResult = Infinity; // If the second sum equals the total, it's not a valid split for comparison.
  } else {
    secondCandidateResult = Math.abs(secondCandidateResult - totalSumOfSegments);
  }

  // Output the smaller of the two adjusted results.
  if (firstCandidateResult < secondCandidateResult) {
    console.log(firstCandidateResult);
  } else {
    console.log(secondCandidateResult);
  }
};

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
