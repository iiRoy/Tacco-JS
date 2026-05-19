function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const charSequence = inputLines[0].split("");
  const sequenceLength = charSequence.length + 1;

  let minimumValue = 0; // Renamed from 'min', remains unused as in original

  // Initialize resetMarkers array (L in original).
  // Elements are 'undefined' by default, replicating original behavior where
  // only specific indices are set to 0.
  const resetMarkers = new Array(sequenceLength);

  // First pass: Identify and mark specific positions that must have a value of 0.
  // These are "reset points" for subsequent calculations.
  for (let idx = 0; idx < sequenceLength - 1; idx++) {
    const currentSymbol = charSequence[idx];
    const nextSymbol = charSequence[idx + 1];

    // Condition 1: If the sequence starts with '<', the first position is a reset point.
    if (idx === 0 && currentSymbol === "<") {
      resetMarkers[idx] = 0;
    }
    // Condition 2: If a '>' is immediately followed by a '<', the position between them is a reset point.
    else if (currentSymbol === ">" && nextSymbol === "<") {
      resetMarkers[idx + 1] = 0;
    }
    // Condition 3: If the sequence ends with '>', the last position is a reset point.
    else if (idx === sequenceLength - 2 && currentSymbol === ">") {
      resetMarkers[idx + 1] = 0;
    }
  }

  let currentLeftCounter = 0; // Renamed from 'h'
  const leftScores = new Array(sequenceLength).fill(0); // Renamed from 'Lf'

  // Second pass: Calculate scores for increasing sequences from left to right.
  // A reset point (marked 0 in resetMarkers) or a non-'<' character resets the counter.
  for (let idx = 0; idx < sequenceLength - 1; idx++) {
    // If the current position is a reset point, reset the left counter.
    if (resetMarkers[idx] === 0) {
      currentLeftCounter = 0;
    }

    const symbolForLeftCheck = charSequence[idx];
    if (symbolForLeftCheck === "<") {
      currentLeftCounter++;
      leftScores[idx + 1] = currentLeftCounter;
    } else {
      currentLeftCounter = 0;
      leftScores[idx + 1] = currentLeftCounter; // Explicitly set to 0, mirroring original flow
    }
  }

  let currentRightCounter = 0; // Renamed from 'h2'
  const rightScores = new Array(sequenceLength).fill(0); // Renamed from 'Lb'

  // Third pass: Calculate scores for increasing sequences from right to left.
  // This loop iterates conceptually backwards by adjusting indices.
  // A reset point (marked 0 in resetMarkers) or a non-'>' character resets the counter.
  for (let idx = 0; idx < sequenceLength - 1; idx++) {
    const resetCheckIndex = sequenceLength - 1 - idx; // Corresponds to L[N-1-i]
    const charSequenceAccessIndex = sequenceLength - 2 - idx; // Corresponds to S[N-2-i]

    // If the current position (from the right) is a reset point, reset the right counter.
    if (resetMarkers[resetCheckIndex] === 0) {
      currentRightCounter = 0;
    }

    const symbolForRightCheck = charSequence[charSequenceAccessIndex];
    if (symbolForRightCheck === ">") {
      currentRightCounter++;
      rightScores[charSequenceAccessIndex] = currentRightCounter;
    } else {
      currentRightCounter = 0;
      rightScores[charSequenceAccessIndex] = currentRightCounter; // Explicitly set to 0, mirroring original flow
    }
  }

  let finalSum = 0; // Renamed from 'ans'
  // Fourth pass: Aggregate the maximum scores at each position.
  // Only positions NOT marked as reset points contribute to the final sum.
  for (let idx = 0; idx < sequenceLength; idx++) {
    // The condition `resetMarkers[idx] !== 0` correctly handles `undefined` values
    // (which are not equal to 0) and `0` values (which are equal to 0).
    if (resetMarkers[idx] !== 0) {
      const scoreFromLeft = leftScores[idx];
      const scoreFromRight = rightScores[idx];
      finalSum += Math.max(scoreFromLeft, scoreFromRight);
    }
  }

  console.log('%s', finalSum);
  return finalSum;
}

// Helper function for testing in a browser environment.
// This function is not part of the core problem logic and is guarded
// to prevent errors in non-browser environments like Node.js.
function testSolution(testCaseNumber) {
  if (typeof document !== 'undefined') {
    const inputField = document.getElementById("input" + testCaseNumber);
    const outputField = document.getElementById("output" + testCaseNumber);
    const resultDisplay = document.getElementById("result" + testCaseNumber);

    if (inputField && outputField && resultDisplay) {
      const testInputData = inputField.value;
      const computedAnswer = processInputData(testInputData);
      const expectedOutput = outputField.value.split("\n")[0];

      let testOutcome = "WA";
      if (String(computedAnswer) === expectedOutput) {
        testOutcome = "AC";
      }
      resultDisplay.innerHTML = testOutcome;
    } else {
      // Log a warning if test elements are missing, but don't halt execution.
      console.warn(`Test elements for case ${testCaseNumber} not found.`);
    }
  } else {
    // In a non-browser environment, this function does nothing.
    // This message is for internal debugging of the testSolution function itself, not problem output.
    // console.log(`Skipping testSolution(${testCaseNumber}) in non-browser environment.`);
  }
}

// Entry point for Node.js execution, must be preserved exactly.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
