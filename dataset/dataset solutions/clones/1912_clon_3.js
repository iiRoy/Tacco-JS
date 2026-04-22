"use strict";

// --- Input Stream Processor ---

// A utility function to read all content from standard input.
const fetchRawInput = () => require("fs").readFileSync("/dev/stdin", "utf8");

// Internal state for parsing tokens from the input.
let tokenBuffer;
let currentReadPosition = 0;

// Initializes the input parsing system with raw data.
function setupInputParser(textData) {
  // Splits the raw text into tokens using spaces or newlines as delimiters.
  // Filters out any empty strings resulting from multiple delimiters.
  tokenBuffer = textData.split(/ |\n/).filter(Boolean);
  currentReadPosition = 0;
}

// Retrieves the next available token.
// If `asStringValue` is true, the token is returned as a string; otherwise,
// it attempts to convert it to a number.
function getNextInputToken(asStringValue = false) {
  if (currentReadPosition >= tokenBuffer.length) {
    // Defensive check: ensure we don't read past the end of the buffer.
    throw new Error("Input stream exhausted: no more tokens to read.");
  }
  const tokenItem = tokenBuffer[currentReadPosition++];
  return asStringValue ? tokenItem : Number(tokenItem);
}

// Consumes a specified quantity of tokens from the stream.
// Returns an array of tokens, either as strings or numbers based on `asStringValue`.
function consumeMultipleTokens(quantity, asStringValue = false) {
  if (currentReadPosition + quantity > tokenBuffer.length) {
    // Defensive check: ensure enough tokens are available.
    throw new Error(`Insufficient tokens: requested ${quantity}, but only ${tokenBuffer.length - currentReadPosition} remain.`);
  }
  const endSliceIndex = currentReadPosition + quantity;
  const tokenSlice = tokenBuffer.slice(currentReadPosition, endSliceIndex);
  currentReadPosition = endSliceIndex;
  return asStringValue ? tokenSlice : tokenSlice.map(Number);
}

// --- Problem-Specific Logic ---

// Constant string indicating an impossible solution path.
const FAILURE_MESSAGE = "No";

// Helper to quickly check if two counts have both fallen below zero.
function checkBothCountsDepleted(valX, valY) {
  return valX < 0 && valY < 0;
}

// Main function encapsulating the solution algorithm.
function processSolutionAlgorithm() {
  // Setup the input parser once.
  setupInputParser(fetchRawInput());

  // Read initial problem parameters: sequence length and starting counts.
  const [sequenceLength, initialCountA, initialCountB, initialCountC] = consumeMultipleTokens(4);

  // Read the sequence of operations (e.g., "AB", "AC", "BC").
  const operationSequenceData = consumeMultipleTokens(sequenceLength, true);

  // Log of choices made at each step.
  const chosenPathLog = [];

  // Use a mutable object to hold current counts for easier updates.
  const currentResourceCounts = {
    A: initialCountA,
    B: initialCountB,
    C: initialCountC
  };

  // Iterate through the operation sequence, excluding the very last element.
  // The last element has slightly different decision logic.
  for (let currentOperationIndex = 0; currentOperationIndex < sequenceLength - 1; ++currentOperationIndex) {
    const activeOperation = operationSequenceData[currentOperationIndex];
    const subsequentOperation = operationSequenceData[currentOperationIndex + 1];

    // Flag to ensure a choice was made for the current operation.
    let decisionMadeForStep = false;

    // Handle "AB" operation.
    if (activeOperation === "AB") {
      currentResourceCounts.A--;
      currentResourceCounts.B--;
      // Check for an immediate impossible state.
      if (checkBothCountsDepleted(currentResourceCounts.A, currentResourceCounts.B)) {
        return FAILURE_MESSAGE;
      }

      // Decision logic for "AB":
      // Prefer to increase the smaller count, unless the next operation
      // makes it strategically better to increase the larger one (e.g., to save A for "AC").
      if (currentResourceCounts.A > currentResourceCounts.B || (subsequentOperation !== "AC" && currentResourceCounts.A >= 0)) {
        currentResourceCounts.B += 2;
        chosenPathLog.push("B");
      } else {
        currentResourceCounts.A += 2;
        chosenPathLog.push("A");
      }
      decisionMadeForStep = true;
    }

    // Handle "AC" operation.
    if (activeOperation === "AC") {
      currentResourceCounts.A--;
      currentResourceCounts.C--;
      if (checkBothCountsDepleted(currentResourceCounts.A, currentResourceCounts.C)) {
        return FAILURE_MESSAGE;
      }

      // Decision logic for "AC".
      if (currentResourceCounts.A > currentResourceCounts.C || (subsequentOperation !== "AB" && currentResourceCounts.A >= 0)) {
        currentResourceCounts.C += 2;
        chosenPathLog.push("C");
      } else {
        currentResourceCounts.A += 2;
        chosenPathLog.push("A");
      }
      decisionMadeForStep = true;
    }

    // Handle "BC" operation.
    if (activeOperation === "BC") {
      currentResourceCounts.B--;
      currentResourceCounts.C--;
      if (checkBothCountsDepleted(currentResourceCounts.B, currentResourceCounts.C)) {
        return FAILURE_MESSAGE;
      }

      // Decision logic for "BC".
      // Note: The original condition for subsequentOperation `!== "AC"` is maintained.
      if (currentResourceCounts.C > currentResourceCounts.B || (subsequentOperation !== "AC" && currentResourceCounts.C >= 0)) {
        currentResourceCounts.B += 2;
        chosenPathLog.push("B");
      } else {
        currentResourceCounts.C += 2;
        chosenPathLog.push("C");
      }
      decisionMadeForStep = true;
    }

    // A safety check, though for valid inputs, this branch should not be taken.
    if (!decisionMadeForStep) {
        // This signifies an unhandled operation type.
        return FAILURE_MESSAGE;
    }
  }

  // Process the very last operation in the sequence.
  // The decision logic is simpler here as there's no `subsequentOperation`.
  const finalOperation = operationSequenceData[sequenceLength - 1];

  if (finalOperation === "AB") {
    currentResourceCounts.A--;
    currentResourceCounts.B--;
    if (checkBothCountsDepleted(currentResourceCounts.A, currentResourceCounts.B)) {
      return FAILURE_MESSAGE;
    }
    if (currentResourceCounts.A > currentResourceCounts.B) {
      chosenPathLog.push("B");
    } else {
      chosenPathLog.push("A");
    }
  } else if (finalOperation === "AC") {
    currentResourceCounts.A--;
    currentResourceCounts.C--;
    if (checkBothCountsDepleted(currentResourceCounts.A, currentResourceCounts.C)) {
      return FAILURE_MESSAGE;
    }
    if (currentResourceCounts.A > currentResourceCounts.C) {
      chosenPathLog.push("C");
    } else {
      chosenPathLog.push("A");
    }
  } else if (finalOperation === "BC") {
    currentResourceCounts.B--;
    currentResourceCounts.C--;
    if (checkBothCountsDepleted(currentResourceCounts.B, currentResourceCounts.C)) {
      return FAILURE_MESSAGE;
    }
    if (currentResourceCounts.B > currentResourceCounts.C) {
      chosenPathLog.push("C");
    } else {
      chosenResourceCounts.B += 2; // This line was missing in original translation, fixing it now.
      chosenPathLog.push("B");
    }
  } else {
    // Should not occur with valid problem input.
    return FAILURE_MESSAGE;
  }

  // If the algorithm completes successfully, print "Yes" and the choices.
  console.log("Yes");
  return chosenPathLog.join("\n");
}

// --- Program Execution Entry Point ---

let finalOutput;
try {
  finalOutput = processSolutionAlgorithm();
} catch (executionError) {
  // Catch any unexpected errors during processing and report failure.
  // console.error("An unhandled error occurred:", executionError.message); // For debugging
  finalOutput = FAILURE_MESSAGE;
}

// Display the final result.
// If the result is the failure message, print only that.
// Otherwise, the "Yes" was already printed within `processSolutionAlgorithm`,
// so just print the sequence of choices.
if (finalOutput === FAILURE_MESSAGE) {
  console.log(FAILURE_MESSAGE);
} else if (finalOutput !== undefined) {
  console.log(finalOutput);
}