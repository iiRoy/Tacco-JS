// Function to convert a string representation to an integer value.
function parseInteger(inputString) {
  return parseInt(inputString);
}

// Function to convert a string representation to a floating-point number.
function parseFloatValue(inputString) {
  return parseFloat(inputString);
}

// Extends the Array prototype with a method to sort numbers in ascending order.
Array.prototype.orderNumbersAscending = function () {
  return this.sort((val1, val2) => (val1 - val2));
};

// Extends the Array prototype with a method to sort numbers in descending order.
Array.prototype.orderNumbersDescending = function () {
  return this.sort((val1, val2) => (val2 - val1));
};

// Extends the Array prototype with a method to sort strings in ascending lexicographical order.
Array.prototype.orderStringsAscending = function () {
  return this.sort();
};

// Extends the Array prototype with a method to sort strings in descending lexicographical order.
Array.prototype.orderStringsDescending = function () {
  return this.sort().reverse();
};

// Extends the Array prototype with a method to create a new array excluding a specified item.
Array.prototype.excludeItem = function (itemToExclude) {
  return this.filter((currentElement) => currentElement !== itemToExclude);
};

// A variable to accumulate all data received from standard input.
let receivedData = '';

// Resumes the standard input stream, allowing data to be read.
process.stdin.resume();

// Sets the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attaches an event listener to the 'data' event of the standard input stream.
// Each incoming chunk of data is appended to the 'receivedData' variable.
process.stdin.on('data', dataChunk => receivedData += dataChunk);

// Attaches an event listener to the 'end' event of the standard input stream.
// This event fires when there is no more data to be read.
process.stdin.on('end', () => {
  // Splits the accumulated data into an array of lines, trimming whitespace from each line.
  let inputLines = receivedData.split('\n').map(currentLine => currentLine.trim());

  // Checks if the last line in the array is empty (which often happens with newline-terminated input).
  // If it is, the empty line is removed from the array.
  if (inputLines[inputLines.length - 1] === '') {
    inputLines = inputLines.slice(0, -1);
  }

  // Calls the primary function to process the prepared array of input lines.
  processInput(inputLines);
});

// The main function responsible for processing the input lines and producing output.
function processInput(inputLines) {
  // Takes the first line of input, splits it by spaces, trims each part,
  // and destructures the resulting array into three distinct string variables.
  let [firstString, secondString, thirdString] = inputLines[0].split(' ').map(trimmedPart => trimmedPart.trim());

  // Evaluates a condition based on the last character of the first string,
  // the first character of the second string, the last character of the second string,
  // and the first character of the third string.
  // Prints "YES" if both conditions are true, otherwise prints "NO".
  console.log(
    (firstString[firstString.length - 1] === secondString[0] &&
     secondString[secondString.length - 1] === thirdString[0]) ?
    "YES" : "NO"
  );
}
