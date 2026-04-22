/*
  This is a Type I clone of the original JavaScript code.
  All variable names, function names, operators, and expressions are
  exactly the same. Only whitespace and comments have been altered
  to create a visually distinct but functionally identical version.
*/

// Initial setup for reading input from standard input and writing to standard output.
var read = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

// Global variables to store parsed input and a buffer for incoming lines.
var obj;
var inLine = [];

// Event handler for each line read from input.
read.on('line', function (input) {
  inLine.push(input);
});

// Event handler for when the input stream closes.
read.on('close', function () {

  // Initialize the input object with all collected lines.
  obj = init(inLine);

  myerr("-----start-----"); // Log start of execution.

  var start = new Date(); // Record start time.

  Main(); // Execute the main program logic.

  var end = new Date() - start; // Calculate elapsed time.

  myerr("----- end -----"); // Log end of execution.
  myerr("time : " + (end) + "ms"); // Log execution time.

  // Log memory usage (heapTotal in KB).
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");

});

// Helper functions for parsing different types of input.
function nextInt() {
  return myconv(next(), 1);
}

function nextStrArray() {
  return myconv(next(), 2);
}

function nextIntArray() {
  return myconv(next(), 4);
}

function nextCharArray() {
  return myconv(next(), 6);
}

function next() {
  return obj.next();
}

function hasNext() {
  return obj.hasNext();
}

// Initializes an object for sequential input reading.
function init(input) {

  var returnObj = {
    list: input, // The array of input lines.
    index: 0, // Current position in the list.
    max: input.length, // Total number of lines.

    // Checks if there are more lines to read.
    hasNext: function () {
      return (this.index < this.max);
    },

    // Retrieves the next line from the input.
    next: function () {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var returnInput = this.list[this.index];
        this.index++;
        return returnInput;
      }
    }
  };

  return returnObj;
}

// Function to output results to standard output.
function myout(s) {
  console.log(s);
}

// Function to output debug messages to standard error.
function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
}

/*
  myconv: A versatile conversion function for input processing.
  [no] specifies the conversion type:
  1: Convert to integer.
  2: Split by space into string array.
  4: Split by space and convert to number array.
  6: Split by character into string array.
  7: Split by character and convert to number array.
  8: Join array elements with space.
  9: Join array elements with newline.
  0: Join array elements without separator.
  Default: Return input as-is.
*/
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map(Number);
      case 6:
        return i.split("");
      case 7:
        return i.split("").map(Number);
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  } catch (e) {
    return i; // On error, return original input.
  }
}

// The main program logic starts here.
function Main() {

  // Read the first line, which contains H and W as integers.
  var one = nextIntArray();
  var H = one[0]; // Height of the grid.
  var W = one[1]; // Width of the grid.

  // Initialize arrays to store the grid and computed values.
  var list = new Array(H); // Stores the character grid.
  var obj = new Array(H); // Stores objects with 'tate' (vertical) and 'yoko' (horizontal) counts.

  // First pass: Populate 'list' and calculate initial 'yoko' counts (horizontal paths).
  for (var i = 0; i < H; i++) {
    list[i] = nextCharArray(); // Read each row as an array of characters.
    obj[i] = new Array(W); // Initialize the row in 'obj'.

    for (var j = 0; j < W; j++) {
      // Initialize each cell's 'tate' and 'yoko' counts to 0.
      obj[i][j] = {
        tate: 0,
        yoko: 0
      };

      // If the current cell is a '.' (empty space).
      if (list[i][j] == ".") {
        if (j == 0) {
          // If it's the first column, horizontal path length is 1.
          obj[i][j].yoko = 1;
        } else {
          // Otherwise, it's the previous cell's yoko count + 1.
          obj[i][j].yoko += obj[i][j - 1].yoko + 1;
        }
      }
    }
  }

  // Second pass: Calculate initial 'tate' counts (vertical paths).
  // Note: This loop iterates column by column, then row by row.
  for (var i = 0; i < W; i++) { // Iterate over columns.
    for (var j = 0; j < H; j++) { // Iterate over rows.

      // If the current cell is a '.' (empty space).
      if (list[j][i] == ".") {
        if (j == 0) {
          // If it's the first row, vertical path length is 1.
          obj[j][i].tate = 1;
        } else {
          // Otherwise, it's the cell above's tate count + 1.
          obj[j][i].tate += obj[j - 1][i].tate + 1;
        }
      }
    }
  }

  // Third pass: Propagate maximum 'tate' and 'yoko' counts from bottom-right to top-left.
  // This ensures each cell stores the maximum continuous path length ending at or extending past it.
  for (var i = H - 1; i >= 0; i--) { // Iterate rows in reverse.
    for (var j = W - 1; j >= 0; j--) { // Iterate columns in reverse.

      if (list[i][j] == ".") {
        // If not in the last column, update 'yoko' with the maximum of current 'yoko' and the cell to its right.
        if (j != W - 1) {
          obj[i][j].yoko = Math.max(obj[i][j].yoko, obj[i][j + 1].yoko);
        }
        // If not in the last row, update 'tate' with the maximum of current 'tate' and the cell below it.
        if (i != H - 1) {
          obj[i][j].tate = Math.max(obj[i][j].tate, obj[i + 1][j].tate);
        }
      }
    }
  }

  var output = 0; // Variable to store the maximum lightable area.

  // Fourth pass: Calculate the maximum lightable area.
  // For each '.' cell, the lightable area is (tate + yoko - 1).
  for (var i = 0; i < H; i++) {
    for (var j = 0; j < W; j++) {
      output = Math.max(output, obj[i][j].tate + obj[i][j].yoko - 1);
    }
  }

  // Output the final maximum lightable area.
  myout(output);
}