var INPUT_PARSER = (function() {
  /**
   * Initializes a new input parsing utility.
   * @param {string} rawInputContent - The complete string content to be parsed.
   * @returns {InputSource} An instance capable of reading tokens and lines.
   */
  function createParser(rawInputContent) {
    return new InputSource(rawInputContent);
  }

  /**
   * Manages the state of input lines and current reading position.
   * @class
   * @param {string} initialStringData - The string data to process.
   */
  function InputSource(initialStringData) {
    // Internal storage for all input lines, trimmed and split.
    this._sourceLines = initialStringData.trim().split("\n");
    // Index of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Extracts the next available token from the current line.
   * If the current line is exhausted, it advances to the next.
   * @param {boolean} [keepRaw=false] - If true, returns the token as a string; otherwise, attempts numeric conversion.
   * @returns {string|number} The extracted token.
   */
  InputSource.prototype.readNextToken = function(keepRaw) {
    var lineData = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var extractedData;

    // If the current line is still a raw string, split it into tokens and reverse for efficient `pop`.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Retrieve the token (originally the first on the line).
    extractedData = lineData[lineIdx].pop();

    // If the line is now empty, move to the subsequent line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, optionally converted to a number.
    return keepRaw ? extractedData : +extractedData;
  };

  /**
   * Reads an entire line, splits it by spaces, and returns the tokens.
   * @param {boolean} [keepRaw=false] - If true, returns tokens as strings; otherwise, attempts numeric conversion.
   * @returns {Array<string|number>} An array of tokens from the read line.
   */
  InputSource.prototype.readLineTokens = function(keepRaw) {
    // Fetch the current line, then increment the line index.
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    // Map tokens to numbers if not keeping raw strings.
    return keepRaw ? lineContent : lineContent.map(element => +element);
  };

  /**
   * Reads a specified number of lines and parses them into a 2D array (matrix).
   * @param {number} count - The number of lines to read for the matrix.
   * @param {boolean} [keepRaw=false] - If true, returns tokens as strings; otherwise, attempts numeric conversion.
   * @returns {Array<Array<string|number>>} A matrix of parsed tokens.
   */
  InputSource.prototype.readMatrix = function(count, keepRaw) {
    // Extract a slice of lines and map each to an array of space-separated tokens.
    var extractedData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count).map(line => line.split(" "));
    // Convert all elements to numbers if not keeping raw strings.
    return keepRaw ? extractedData : extractedData.map(row => row.map(element => +element));
  };

  /**
   * Reads a specified number of lines and returns them as a 1D array.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [keepRaw=false] - If true, returns lines as strings; otherwise, attempts numeric conversion.
   * @returns {Array<string|number>} An array of parsed lines.
   */
  InputSource.prototype.readLines = function(count, keepRaw) {
    // Extract a slice of lines.
    var extractedData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
    // Convert all elements to numbers if not keeping raw strings.
    return keepRaw ? extractedData : extractedData.map(element => +element);
  };

  return createParser;
})();

// Initialize the input reader by reading content from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Print the result obtained from the main processing function.
console.log(processInputAndCalculate());

/**
 * The primary function to execute the problem's logic.
 * It reads input, performs calculations, and returns the final answer.
 * @returns {number} The count of food items liked by all individuals.
 */
function processInputAndCalculate() {
  // Read the total number of people.
  var numPeople = inputReader.readNextToken();
  // Read the total number of distinct food items.
  var numFoods = inputReader.readNextToken();

  // Create an array to store the count of people who like each food item.
  // Initialize all counts to zero.
  var foodPreferenceCounts = Array(numFoods).fill(0);
  // Variable to store the final answer: count of foods liked by everyone.
  let commonFoodCount = 0;

  // Iterate through each person to record their food preferences.
  for (var personIdx = 0; personIdx < numPeople; personIdx++) {
    // Read the line containing preferences for the current person.
    // The first element is the count of items they like, followed by the item IDs.
    var personPreferences = inputReader.readLineTokens();
    // Loop through the actual food item IDs liked by this person.
    // The loop starts from 1 because personPreferences[0] is the count.
    // The original code uses personPreferences[prefIdx - 1] to access the food ID.
    // This means personPreferences[0] (the count) is also treated as a food ID.
    for (var prefIdx = 1; prefIdx <= personPreferences[0]; prefIdx++) {
      // Increment the count for the specific food item ID.
      foodPreferenceCounts[personPreferences[prefIdx - 1]]++;
    }
  }

  // After processing all people's preferences, check which food items
  // were liked by every single person.
  for (personIdx = 0; personIdx < numFoods; personIdx++) {
    // If a food item's count matches the total number of people,
    // it means everyone likes this food.
    if (foodPreferenceCounts[personIdx] === numPeople) {
      commonFoodCount++;
    }
  }

  // Return the final tally of commonly liked food items.
  return commonFoodCount;
}
