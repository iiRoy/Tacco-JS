"use strict"; // Enforce strict mode for cleaner code practices

// This class is responsible for handling input data,
// parsing it line by line and token by token from a raw string.
function InputProcessor(sourceString, defaultParser) {
  // Stores all input lines as an array of strings, split by newline.
  this.sourceLines = sourceString.split("\n");
  // Index for the current token being processed within the current line.
  this.tokenCursor = 0;
  // Index for the current line being processed from the sourceLines array.
  this.lineCursor = 0;
  // The default function to use for mapping token strings to desired types (e.g., String, Number).
  this.valueMapper = defaultParser || String; // Defaults to String parsing if no parser is provided.
}

// Prototype methods for InputProcessor
InputProcessor.prototype.fetchNextToken = function () {
  // Retrieve the current line based on the line cursor.
  const currentLine = this.sourceLines[this.lineCursor];

  // If the current line is undefined or null, it means we've reached the end of the input stream.
  // Returning null signifies no more tokens are available.
  if (currentLine === undefined || currentLine === null) {
    return null; // Explicitly indicate end of input.
  }

  // Trim leading/trailing whitespace from the line and split it into individual tokens by space.
  const lineTokens = currentLine.trim().split(" ");

  // If the token cursor is beyond the number of tokens on the current line,
  // it implies we need to advance to the next line. This can happen if the previous
  // call consumed the last token or if the line was effectively empty after trimming.
  if (this.tokenCursor >= lineTokens.length) {
    this.tokenCursor = 0; // Reset token cursor for the new line.
    this.lineCursor++; // Move to the subsequent line.
    // Recursively call fetchNextToken to process the new line or handle end of input.
    return this.fetchNextToken();
  }

  // Extract the token at the current cursor position.
  const tokenValue = lineTokens[this.tokenCursor];
  // Advance the token cursor to point to the next token.
  this.tokenCursor++;

  // If the token cursor has now reached the end of the current line's tokens,
  // prepare for the next line by resetting the token cursor and advancing the line cursor.
  if (this.tokenCursor === lineTokens.length) {
    this.tokenCursor = 0; // Reset for the next line.
    this.lineCursor++; // Move to the next line in anticipation.
  }

  // Apply the designated value mapping function to the extracted token and return the result.
  return this.valueMapper(tokenValue);
};

InputProcessor.prototype.parseLineArray = function () {
  const currentLineText = this.sourceLines[this.lineCursor];

  // If no more lines are available, return null to indicate completion.
  if (currentLineText === undefined || currentLineText === null) {
    return null;
  }

  // Reset the token cursor to 0, as a full line is being processed.
  this.tokenCursor = 0;
  // Advance the line cursor to the next line immediately.
  this.lineCursor++;

  // Split the line into tokens and apply the value mapper to each token,
  // returning an array of parsed values. An arrow function is used to correctly
  // preserve the 'this' context for 'valueMapper'.
  return currentLineText.split(" ").map(token => this.valueMapper(token));
};

// The primary function to analyze the color sequence and compute the minimum required changes.
function analyzeColorSequence(rawInputText) {
  // Initialize an input reader, configured to return string values by default.
  const dataStreamReader = new InputProcessor(rawInputText, String);

  // The original problem might have read a 'length' variable, but the actual logic
  // uses the string's length directly. This variable is now removed as it's unused.
  // const sequenceLength = Number(dataStreamReader.fetchNextToken()); // Removed as per Type III

  // Read the color sequence string from the input.
  const colorSequence = dataStreamReader.fetchNextToken();

  // Implement a guard clause for empty or null input sequences.
  // For an empty sequence, no changes are needed.
  if (!colorSequence || colorSequence.length === 0) {
    console.log(0);
    return;
  }

  // Initialize a counter for '.' (white cells) that are initially present in the sequence.
  // These are the cells that would need to be flipped if the entire sequence were converted to '#'.
  let whiteCellsToFlipOnRight = 0;
  // Iterate through the sequence to count initial white cells using a modern for...of loop.
  for (const char of colorSequence) {
    if (char === ".") {
      whiteCellsToFlipOnRight++;
    }
  }

  // Initialize the variable to store the minimum number of changes found.
  // Initially, this is the cost if all '.' are changed to '#'.
  let minimumRequiredChanges = whiteCellsToFlipOnRight;

  // This variable tracks the count of '#' (black cells) that are to the left
  // of the current potential splitting point. These would need to be flipped to '.'.
  let blackCellsToFlipOnLeft = 0;

  // Iterate through the color sequence to evaluate each possible splitting point.
  // The 'idx' represents the position *after* which the split is considered.
  for (let idx = 0; idx < colorSequence.length; idx++) {
    // Get the character at the current index.
    const currentChar = colorSequence[idx];

    if (currentChar === "#") {
      // If the current cell is '#', it falls into the 'left' part of the split
      // and would need to be changed to '.'
      blackCellsToFlipOnLeft++;
    } else { // currentChar === '.'
      // If the current cell is '.', it's no longer a white cell on the 'right' side
      // that needs to be flipped to '#'.
      whiteCellsToFlipOnRight--;
    }

    // Calculate the total transformation cost for the current split point.
    // This is the sum of black cells on the left (to be flipped to white)
    // and white cells on the right (to be flipped to black).
    const currentTransformationCost = blackCellsToFlipOnLeft + whiteCellsToFlipOnRight;

    // Update the minimum changes if the current cost is lower.
    if (currentTransformationCost < minimumRequiredChanges) {
      minimumRequiredChanges = currentTransformationCost;
    }
  }

  // Output the final calculated minimum number of changes.
  console.log(minimumRequiredChanges);
}

// Standard setup for reading input in a competitive programming environment.
// Reads the entire content of standard input as a UTF-8 string and processes it.
analyzeColorSequence(require("fs").readFileSync("/dev/stdin", "utf8"));