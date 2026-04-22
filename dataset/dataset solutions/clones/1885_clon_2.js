"use strict"; /* This directive enforces stricter parsing and error handling. */
var rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = rawInputData.split(/ |\n/),
  tokenIndex = 0; // Initialize token list and current position.

function consumeNextToken(asString) {
  // Retrieves the next token from the input array.
  return asString ? tokenArray[tokenIndex++] : +tokenArray[tokenIndex++];
}

function consumeMultipleTokens(count, asString) {
  // Grabs a specified number of tokens.
  return asString ? tokenArray.slice(tokenIndex, tokenIndex += count) : tokenArray.slice(tokenIndex, tokenIndex += count).map(v => +v);
}

function consumeMatrixTokens(numRows, numCols, asString) {
  // Reads a matrix of tokens.
  var resultMatrix = [],
    rowIndex = 0;
  if (asString)
    for (; rowIndex < numRows; rowIndex++) resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += numCols));
  else
    for (; rowIndex < numRows; rowIndex++) resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += numCols).map(v => +v));
  return resultMatrix;
}

function createMultiDimArray(defaultValue) {
  // Creates a multi-dimensional array dynamically.
  var args = arguments,
    argCount = args.length,
    arrayCreationString = "Array(args[" + --argCount + "]).fill().map(_=>{return " + defaultValue + ";})";
  while (--argCount) arrayCreationString = "Array(args[" + argCount + "]).fill().map(_=>" + arrayCreationString + ")";
  return eval(arrayCreationString);
}

var programResult = executeMainLogic();
if (programResult !== undefined) {
  console.log(programResult);
}

function executeMainLogic() {
  // Main function to process the input and determine validity.
  var negativeOutcome = "No",
    positiveOutcome = "Yes"; // Predefined strings for output.

  var numSequences = consumeNextToken(); // Read the total number of sequences.
  var negativeBalancedSequences = [],
    totalBalanceAccumulator = 0,
    remainingPositiveBalance = 0; // Data structures and counters.

  // First pass: Process each sequence string.
  for (var sequenceIndex = 0; sequenceIndex < numSequences; sequenceIndex++) {
    var minBalanceDuringScan = 0,
      currentSequenceBalance = 0; // State for current sequence.
    var currentSequenceString = consumeNextToken(1); // Get the next sequence as a string.

    // Scan characters within the current sequence.
    for (var characterPosition = 0; characterPosition < currentSequenceString.length; characterPosition++) {
      if (currentSequenceString[characterPosition] === "(") {
        currentSequenceBalance++; // Increment balance for an opening parenthesis.
      } else {
        currentSequenceBalance--; // Decrement balance for a closing parenthesis.
        if (currentSequenceBalance < minBalanceDuringScan) {
          minBalanceDuringScan = currentSequenceBalance; // Update the minimum balance encountered.
        }
      }
    }
    totalBalanceAccumulator += currentSequenceBalance; // Add sequence's final balance to global total.
    if (currentSequenceBalance > 0) {
      remainingPositiveBalance += currentSequenceBalance; // Accumulate positive final balances.
    } else {
      negativeBalancedSequences.push([-minBalanceDuringScan, currentSequenceBalance]); // Store info for sequences ending with non-positive balance.
    }
  }

  // Check if the total balance of all sequences is zero.
  if (totalBalanceAccumulator !== 0) {
    return negativeOutcome; // If not zero, the overall sequence is invalid.
  }

  // Sort sequences that ended with non-positive balance.
  // Sorting by the required 'debt' (negative of minBalanceDuringScan) in descending order.
  negativeBalancedSequences.sort((seqA, seqB) => seqB[0] - seqA[0]);

  // Second pass: Process sequences that ended with non-positive balance.
  for (var processedIndex = 0; processedIndex < negativeBalancedSequences.length; processedIndex++) {
    var [requiredBalance, sequenceFinalBalance] = negativeBalancedSequences[processedIndex]; // Destructure values.

    // Check if the current positive balance can cover the deficit.
    if (requiredBalance > remainingPositiveBalance) {
      return negativeOutcome; // If not enough positive balance, invalid.
    }
    remainingPositiveBalance -= sequenceFinalBalance; // Deduct the (negative) final balance, effectively adding its absolute value.
  }

  return positiveOutcome; // All conditions met, the overall sequence is valid.
}