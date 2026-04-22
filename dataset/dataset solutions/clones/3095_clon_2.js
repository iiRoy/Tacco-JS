"use strict";

// This class provides functionality to parse input text,
// allowing retrieval of values either token by token or line by line.
function TextParser( sourceText, typeConverter ) {
  // Internal storage for the input text, split into an array of lines.
  this._textLines = sourceText.split("\n");

  // Keeps track of the current token's position within the active line.
  this._tokenIndex = 0;

  // Maintains the index of the current line being processed from the input.
  this._lineIndex = 0;

  // A function used to convert extracted tokens to a desired data type.
  // Defaults to the built-in Number conversion if not specified.
  this._valueConverter = typeConverter || Number;
}

// Prototype method to fetch the subsequent individual data value (token).
TextParser.prototype.nextValue = function() {
  // Retrieve the string content of the current line based on _lineIndex.
  var currentLineContent = this._textLines[this._lineIndex];

  // If the current line is empty or undefined, there are no more values to read.
  if ( ! currentLineContent ) {
    return;
  }

  // Process the current line: trim leading/trailing whitespace and split into tokens.
  var lineTokens = currentLineContent.trim().split(" ");

  // Extract the specific token at the current _tokenIndex.
  var extractedToken = lineTokens[this._tokenIndex];

  // Increment the token index to point to the next token for the subsequent call.
  this._tokenIndex++;

  // Check if all tokens on the current line have been consumed.
  if ( lineTokens.length === this._tokenIndex ) {
    // If so, reset the token index and advance to the next line in the input.
    this._tokenIndex = 0;
    this._lineIndex++;
  }

  // Apply the stored _valueConverter function to the extracted token and return the result.
  return this._valueConverter(extractedToken);
};

// Prototype method to retrieve all data values (tokens) present on the current line.
TextParser.prototype.allValuesInLine = function() {
  // Obtain the full string content of the line at the current _lineIndex.
  var currentLineContent = this._textLines[this._lineIndex];

  // If the line content is non-existent, there's nothing to return.
  if ( ! currentLineContent ) {
    return;
  }

  // Reset the token index as this method processes the entire line at once.
  this._tokenIndex = 0;

  // Move to the next line immediately after processing the current one.
  this._lineIndex++;

  // Split the line into tokens, then apply the _valueConverter to each token,
  // returning an array of converted values.
  return currentLineContent.split(" ").map(this._valueConverter);
};

// Expose the TextParser class for consumption by other JavaScript modules.
module.exports = TextParser;

// The primary function responsible for executing the application's core logic.
function executeLogic( sourceInput ) {
  // Instantiate the TextParser to handle the provided sourceInput.
  // Values will be parsed as strings in this specific use case.
  const dataHandler = new TextParser(sourceInput, String);

  // Retrieve the very first token from the input stream.
  const extractedChar = dataHandler.nextValue();

  // Define a mapping for DNA base complements.
  // Use the extracted character as a key to find its corresponding complement
  // and output it to the console.
  console.log({
    A: "T",
    C: "G",
    G: "C",
    T: "A"
  }[extractedChar]);

}


// Initiate the program by calling executeLogic.
// It reads input from standard input (/dev/stdin) as a UTF-8 encoded string.
executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));