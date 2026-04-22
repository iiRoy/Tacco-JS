var INPUT_PROCESSOR=(function(){
  /**
   * Initializes a new text processing utility.
   * This function acts as a factory for creating TextContentProcessor instances.
   * @param {string} sourceContent - The raw text content to be processed.
   * @returns {TextContentProcessor} A new processor object, ready for data extraction.
   */
  function initializeProcessor(sourceContent){
    return new TextContentProcessor(sourceContent);
  }

  /**
   * Constructor for the TextContentProcessor.
   * This object manages an array of text lines and a pointer to the current reading position.
   * @param {string} rawInput - The complete input text, typically read from a file or stream.
   */
  function TextContentProcessor(rawInput){
    // Trim leading/trailing whitespace from the entire input, then split into individual lines.
    this._contentLines = rawInput.trim().split("\n");
    // Initialize the line pointer to the very first line (index 0).
    this._currentLinePointer = 0;
  }

  /**
   * Extracts a single item from the current line of text.
   * If the line has not been previously processed, it splits the line into words
   * and reverses them before extracting the last element (effectively the first word
   * of the original line, or the next word if previous calls have popped elements).
   * The line pointer is advanced if the current line becomes empty after extraction.
   * @param {boolean} returnAsText - If true, the item is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted data item.
   */
  TextContentProcessor.prototype.getSingleValue = function(returnAsText){
    var storedLines = this._contentLines, // Reference to the internal array of lines
        linePosition = this._currentLinePointer, // Current index for reading
        extractedItem; // Placeholder for the value that will be returned

    // Check if the current line at 'linePosition' is still a single string.
    // If it is, it means it hasn't been split into words yet.
    if (typeof storedLines[linePosition] === "string") {
      // Split the line by spaces and reverse the order of words.
      // This allows 'pop()' to retrieve words from the beginning of the original line.
      storedLines[linePosition] = storedLines[linePosition].split(" ").reverse();
    }

    // Retrieve the last element from the (potentially reversed) word array.
    extractedItem = storedLines[linePosition].pop();

    // If the current line (now an array of words) is empty after popping,
    // increment the line pointer to move to the next line for subsequent reads.
    if (!storedLines[linePosition].length) {
      this._currentLinePointer++;
    }

    // Return the extracted item, either as its original string type or converted to a number.
    return returnAsText ? extractedItem : +extractedItem;
  };

  /**
   * Reads an entire line of text, splits it into individual items based on spaces,
   * and then advances the line pointer to the next line.
   * @param {boolean} outputAsStrings - If true, returns an array of strings; otherwise, converts each item to a number.
   * @returns {Array<string|number>} An array containing all items from the processed line.
   */
  TextContentProcessor.prototype.fetchLineItems = function(outputAsStrings){
    // Retrieve the current line, split it by spaces, and then increment the line pointer.
    var lineTokens = this._contentLines[this._currentLinePointer++].split(" ");

    // Based on the 'outputAsStrings' flag, return the array of tokens as strings or numbers.
    return outputAsStrings ? lineTokens : lineTokens.map(token => +token);
  };

  /**
   * Reads a specified number of consecutive lines, treating each as a row in a matrix.
   * Each line is split into items, forming a 2D array. The line pointer is advanced
   * by the number of lines read.
   * @param {number} numLinesToProcess - The total count of lines to read for the matrix.
   * @param {boolean} asStringsMatrix - If true, the matrix cells remain strings; otherwise, they are converted to numbers.
   * @returns {Array<Array<string|number>>} A two-dimensional array representing the matrix data.
   */
  TextContentProcessor.prototype.readBlockMatrix = function(numLinesToProcess, asStringsMatrix){
    // Extract a segment of lines starting from the current pointer,
    // and for each line, split it into an array of items.
    var dataMatrix = this._contentLines.slice(this._currentLinePointer, this._currentLinePointer += numLinesToProcess)
                       .map(line => line.split(" "));

    // If numerical output is requested, iterate through the matrix rows and convert each item to a number.
    return asStringsMatrix ? dataMatrix : dataMatrix.map(row => row.map(item => +item));
  };

  /**
   * Retrieves a specified number of raw lines directly from the input buffer.
   * The line pointer is advanced by the number of lines retrieved.
   * @param {number} linesToExtract - The quantity of lines to fetch.
   * @param {boolean} stringsOnly - If true, returns the lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array containing the raw content of the requested lines.
   */
  TextContentProcessor.prototype.getRawLines = function(linesToExtract, stringsOnly){
    // Extract a slice of lines from the current position and advance the pointer.
    var rawLineData = this._contentLines.slice(this._currentLinePointer, this._currentLinePointer += linesToExtract);

    // Return the lines either as their original string form or mapped to numbers.
    return stringsOnly ? rawLineData : rawLineData.map(line => +line);
  };

  return initializeProcessor; // Export the factory function as the public interface of the module.
})();

// Create an instance of our input processor.
// It reads the entire content of standard input synchronously, encoded as UTF-8.
var stdInputHandler = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the primary problem-solving function and output its result to the console.
console.log(performAnalysis());

/**
 * Main application logic to determine if an input string matches a specific pattern
 * derived from the word "keyence". The pattern allows for any characters to exist
 * between a prefix and a suffix of "keyence".
 * @returns {string} "YES" if the input string matches the pattern, "NO" otherwise.
 */
function performAnalysis(){
  var inputSequence = stdInputHandler.getSingleValue(true); // Read the primary input string (as text).
  var referenceWord = "keyence"; // The fixed word to form patterns from.
  var outcomeMessage = "NO"; // Initialize the result to "NO".

  // Iterate through all possible split points within the 'referenceWord'.
  // 'splitPoint' represents the length of the prefix.
  for (var splitPoint = 0; splitPoint <= referenceWord.length; splitPoint++) {
    // Construct a regular expression pattern:
    // '^'    : Matches the beginning of the string.
    // prefix : A part of 'referenceWord' from the start up to 'splitPoint'.
    // '.*'   : Matches any character (except newline) zero or more times.
    // suffix : The remaining part of 'referenceWord' from 'splitPoint' to the end.
    // '$'    : Matches the end of the string.
    var currentPattern = "^" + referenceWord.slice(0, splitPoint) + ".*" + referenceWord.slice(splitPoint) + "$";

    // Test if the 'inputSequence' string matches the dynamically generated regex pattern.
    if (inputSequence.match(currentPattern)) {
      return "YES"; // If a match is found at any split point, the condition is met.
    }
  }

  // If the loop completes without finding any matching pattern, return the default "NO".
  return outcomeMessage;
}