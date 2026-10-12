// Extends String prototype to right-justify a string with spaces.
String.prototype.rightPad = function(width) {
  let paddingStr = ''; // Initialize an empty string for padding
  // Loop to build the padding string with 'width' number of spaces
  for (let idx = 0; idx < width; idx++) {
    paddingStr += ' ';
  }
  // Concatenate padding and the original string, then slice from the end
  // to ensure the total length is 'width'.
  return (paddingStr + this).slice(-width);
};

// Extends Number prototype to right-justify a number.
// Converts the number to a string first, then uses the string's rightPad method.
Number.prototype.rightPad = function(width) {
  return (this + '').rightPad(width); // Convert number to string and apply string padding
};

// Extends Array prototype to apply right-justification to each element.
Array.prototype.rightPad = function(width) {
  // Map over each element in the array and apply the rightPad method to it.
  return this.map(function(currentVal) {
    return currentVal.rightPad(width);
  });
};

// Extends Array prototype to calculate the sum of its numeric elements.
Array.prototype.total = function() {
  // Uses reduce to sum all elements.
  // The unary plus operator (+currentValue) ensures elements are treated as numbers.
  return this.reduce(function(accumulator, currentValue) {
    return (+currentValue) + accumulator;
  }, 0); // Initial value for the accumulator is 0
};

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

// Process input blocks until a line starting with '0' is encountered.
while (inputLines[0] !== '0') {
  // Get the number of lines for the current block and remove it from the input array.
  const currentLineCount = +inputLines.shift();

  // Initialize arrays to store processed data for the current block.
  const processedRows = [];
  const finalSummaryRow = [];

  // Loop through each line of numbers in the current block.
  for (let rowIndex = 0; rowIndex < currentLineCount; rowIndex++) {
    // Extract numbers from the current input line, splitting by space.
    const rowNumbers = inputLines.shift().split(' ');

    // Store the original numbers for column sum calculation later.
    processedRows.push(rowNumbers);

    // Calculate the sum of numbers in the current row and append it to the row.
    rowNumbers.push(rowNumbers.total());

    // Print the right-padded numbers of the current row, joined without spaces.
    console.log(rowNumbers.rightPad(5).join(''));
  }

  // Calculate the sums for each column, including the row sums column.
  // The loop runs for 'currentLineCount' columns plus one for the row totals.
  for (let colIndex = 0; colIndex < currentLineCount + 1; colIndex++) {
    // Map over the processed rows to get the element at the current column index,
    // then calculate the total sum for that column.
    finalSummaryRow.push(processedRows.map(function(rowElement) {
      return rowElement[colIndex];
    }).total());
  }

  // Print the right-padded numbers of the final summary row, joined without spaces.
  console.log(finalSummaryRow.rightPad(5).join(''));
}
