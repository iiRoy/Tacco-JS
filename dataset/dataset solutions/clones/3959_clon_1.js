var read = require('readline')
  .createInterface({
    input: process.stdin,
    output: process.stdout
  });

/* Global variables for input processing */
var obj;
var inLine = [];

// Event listener for each line of input
read.on('line', function (input) {
  inLine.push(input);
});

// Event listener when input stream closes
read.on('close', function () {
  obj = init(inLine); // Initialize input object

  myerr("-----start-----"); // Log start time
  var start = new Date();

  Main(); // Execute main program logic

  var end = new Date() - start; // Calculate execution time
  myerr("----- end -----");
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/* Helper functions for parsing input */
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

/**
 * Initializes an object to handle line-by-line input.
 * @param {Array<string>} input - An array of input strings.
 * @returns {object} An object with methods to read and check input.
 */
function init(input) {

  var returnObj = {
    list: input,
    index: 0,
    max: input.length,

    hasNext: function () {
      return (this.index < this.max);
    },

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

// Function to output results to console
function myout(s) {
  console.log(s);
}

// Function for debugging output to console error stream
function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
}

/*
 * Data conversion utility function.
 * 'no' parameter specifies conversion type:
 *  1: Convert to integer.
 *  2: Split string by space.
 *  4: Split by space, convert to number array.
 *  6: Split string into character array.
 *  7: Split by character, convert to number array.
 *  8: Join array elements with space.
 *  9: Join array elements with newline.
 *  0: Join array elements without separator.
 *  Default: Return input as is.
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
    return i;
  }
}

// Main function containing the problem's logic
function Main() {
  var one = nextIntArray();
  var A = one[0];
  var B = one[1];

  var N = 100;
  var list = new Array(N);

  // Initialize the grid
  for (var i = 0; i < N; i++) {
    if (i < 50) {
      list[i] = new Array(N).fill("#");
    } else {
      list[i] = new Array(N).fill(".");
    }
  }


  // Place '.' for A-1 elements
  for (var i = 0; i < A - 1; i++) {
    var x = (i * 2) % N;
    var y = Math.floor(i / N) * 2;
    list[y][x] = ".";
  }

  // Place '#' for B-1 elements
  for (var i = 0; i < B - 1; i++) {
    var x = (i * 2) % N;
    var y = Math.floor(i / N) * 2 + 51;
    list[y][x] = "#";
  }

  // Output dimensions
  myout(N + " " + N);

  // Output the modified grid
  for (var i = 0; i < N; i++) {
    myout(myconv(list[i], 0));
  }
}