// This module provides file system utilities.
const fileSystem = require('fs');

// Attempt to read standard input synchronously.
// Determine the size of the standard input stream.
const inputDescriptor = process.stdin.fd;
const streamStats = fileSystem.fstatSync(inputDescriptor);
const dataLength = streamStats.size;

// Allocate a buffer to hold the input data.
const inputBuffer = Buffer.alloc(dataLength);

// Read data from standard input into the buffer.
const actualBytesRead = fileSystem.readSync(inputDescriptor, inputBuffer, 0, dataLength, 0);

// Convert the buffer content to a UTF-8 string and split by newline.
// Filter out any empty lines that might result from extra newlines.
const rawInputLines = inputBuffer.toString('utf8', 0, actualBytesRead)
                                 .split('\n')
                                 .filter(line => line.trim().length > 0);

// Function to initialize a 2D array (grid) with a specific value.
function createInitializedGrid(rows, columns, initialValue) {
  // Input validation for dimensions
  if (rows <= 0 || columns <= 0) {
    console.warn("Warning: Grid dimensions should be positive. Returning empty grid.");
    return [];
  }

  const twoDArray = [];
  // Use a modern loop structure for iteration
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const currentRow = new Array(columns).fill(initialValue); // More concise row creation
    twoDArray.push(currentRow);
  }
  return twoDArray;
}

// Core logic to determine the maximum achievable score based on available segments.
// This implements a dynamic programming approach.
function calculateMaxSegmentScore(totalLengthRequirement, availableSegments) {
  // Early exit for invalid inputs
  if (totalLengthRequirement <= 0 || !Array.isArray(availableSegments) || availableSegments.length === 0) {
    return 0; // No score achievable
  }

  const segmentCount = availableSegments.length;

  // dpGrid[i][j] stores the maximum score using the first 'i' segments
  // to achieve a total length 'j'.
  // Dimensions: (segmentCount + 1) x (totalLengthRequirement + 1)
  const dpGrid = createInitializedGrid(segmentCount + 1, totalLengthRequirement + 1, 0);

  // Iterate through each available segment.
  for (let currentSegmentIdx = 0; currentSegmentIdx < segmentCount; currentSegmentIdx++) {
    const currentSegment = availableSegments[currentSegmentIdx];
    // Destructure segment properties for clarity
    const [segmentStart, segmentDuration, segmentValue] = currentSegment; 

    // Iterate through all possible total lengths up to the requirement.
    for (let currentTotalLen = 0; currentTotalLen <= totalLengthRequirement; currentTotalLen++) {
      // Option 1: Don't use the current segment.
      // The max score is simply the max score without this segment for the same total length.
      let scoreWithoutCurrent = dpGrid[currentSegmentIdx][currentTotalLen];
      
      // Option 2: Consider using the current segment.
      let scoreWithCurrent = scoreWithoutCurrent; // Default to not using it.

      // Check if the current segment's start point is within the current total length.
      if (segmentStart <= currentTotalLen) {
        // Calculate the range of previous lengths that could lead to currentTotalLen
        // by adding the current segment (segmentStart to segmentStart + segmentDuration).
        // The previous length `prevLen` must satisfy:
        // prevLen + segmentStart <= currentTotalLen (to fit the start)
        // prevLen + segmentStart + segmentDuration >= currentTotalLen (to cover up to currentTotalLen)
        // The slice captures lengths from (currentTotalLen - segmentDuration) to (currentTotalLen - segmentStart).
        
        const possiblePreviousLenMin = Math.max(0, currentTotalLen - segmentDuration); // Ensure index is not negative
        const possiblePreviousLenMaxExclusive = currentTotalLen - segmentStart + 1; // Slice end is exclusive

        // Extract relevant previous DP values
        const potentialPreviousScores = dpGrid[currentSegmentIdx].slice(possiblePreviousLenMin, possiblePreviousLenMaxExclusive);

        // Find the maximum score from the potential previous states.
        // Handle the case where potentialPreviousScores might be empty.
        const maxPreviousScore = potentialPreviousScores.length > 0
                                 ? Math.max(...potentialPreviousScores)
                                 : -Infinity; // If no valid previous state, cannot use this segment effectively.

        // If a valid previous score was found, add the current segment's value.
        if (maxPreviousScore !== -Infinity) {
          scoreWithCurrent = Math.max(scoreWithoutCurrent, maxPreviousScore + segmentValue);
        }
      }
      // Update the DP table for the current segment and total length.
      dpGrid[currentSegmentIdx + 1][currentTotalLen] = scoreWithCurrent;
    }
  }
  // The final answer is in the bottom-right corner of the DP table.
  return dpGrid[segmentCount][totalLengthRequirement];
}

// Main execution orchestrator function.
function processProgramLogic() {
  let currentLinePointer = 0; // Use an index to consume input lines

  // Read the number of available segments (phrases).
  const numSegments = parseInt(rawInputLines[currentLinePointer++], 10);
  if (isNaN(numSegments) || numSegments < 0) {
    console.error("Invalid number of segments provided. Exiting.");
    return; // Exit if input is bad
  }

  const segmentDefinitionList = [];
  // Populate the list of segments from input.
  for (let i = 0; i < numSegments; i++) {
    if (currentLinePointer >= rawInputLines.length) {
      console.error("Insufficient input lines for segments. Exiting.");
      return;
    }
    const segmentData = rawInputLines[currentLinePointer++].split(' ').map(Number);
    // Basic validation for segment data format
    if (segmentData.length !== 3 || segmentData.some(isNaN)) {
      console.error(`Invalid segment data format on line ${currentLinePointer - 1}: "${rawInputLines[currentLinePointer - 2]}". Expected 3 numbers. Exiting.`);
      return;
    }
    segmentDefinitionList.push(segmentData);
  }

  // Sort segments based on their 'value' (p) in ascending order.
  // This can sometimes improve performance or ensure consistency in specific DP implementations,
  // though for this particular problem, the order of segments doesn't affect the final maximum.
  segmentDefinitionList.sort((segA, segB) => segA[2] - segB[2]);

  // Read the number of target lengths (melodies).
  const numTargetLengths = parseInt(rawInputLines[currentLinePointer++], 10);
  if (isNaN(numTargetLengths) || numTargetLengths < 0) {
    console.error("Invalid number of target lengths provided. Exiting.");
    return;
  }

  const targetLengthValues = [];
  // Populate the list of target lengths.
  for (let i = 0; i < numTargetLengths; i++) {
    if (currentLinePointer >= rawInputLines.length) {
      console.error("Insufficient input lines for target lengths. Exiting.");
      return;
    }
    const currentTargetLen = parseInt(rawInputLines[currentLinePointer++], 10);
    if (isNaN(currentTargetLen) || currentTargetLen < 0) {
      console.error(`Invalid target length on line ${currentLinePointer - 1}: "${rawInputLines[currentLinePointer - 2]}". Expected a non-negative number. Exiting.`);
      return;
    }
    targetLengthValues.push(currentTargetLen);
  }

  const computedResults = [];
  let zeroScoreDetected = false; // Flag to track if any calculation yielded a zero score.

  // Process each target length.
  for (const currentTargetLength of targetLengthValues) {
    const maxAchievedScore = calculateMaxSegmentScore(currentTargetLength, segmentDefinitionList);

    if (maxAchievedScore === 0) {
      zeroScoreDetected = true; // Set flag if a zero score is found.
    } else {
      computedResults.push(maxAchievedScore);
    }
  }

  // Final output based on the 'zeroScoreDetected' flag.
  // If any target length resulted in a score of 0, output -1 for all results.
  if (zeroScoreDetected) {
    console.log(-1); 
  } else {
    // Otherwise, output all computed non-zero scores.
    computedResults.forEach(score => console.log(score));
  }
}

// Execute the main program logic, wrapped in a try-catch for robustness.
try {
  processProgramLogic();
} catch (executionError) {
  console.error("An unexpected error occurred during program execution:", executionError.message);
  // In a production environment, more detailed error logging might be appropriate.
}