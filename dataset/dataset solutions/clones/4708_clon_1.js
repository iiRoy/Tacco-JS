// This section handles input/output initialization
// It sets up a readline interface to read from standard input
var read = require('readline').createInterface({
  // Input stream for the readline interface
  input: process.stdin,
  // Output stream for the readline interface
  output: process.stdout
});

// Declare variables for storing input and parsed objects
var obj; // Will hold the parsed input object
var inLine = []; // Array to store each line of input

// Event listener for 'line' event: when a line is read, push it to inLine array
read.on('line', function (input) {
  // Add the read input line to the array
  inLine.push(input);
});

// Event listener for 'close' event: when input stream closes, process data
read.on('close', function () {
  // Initialize the 'obj' with the collected input lines
  obj = init(inLine);

  // Output a debug message to stderr, indicating input/output direction
  console.error('\n↑入力 ↓出力');

  // Call the main function to start the problem-solving logic
  Main();
});

// Helper function to create a deep clone of an object or Set
// It uses JSON.parse(JSON.stringify(obj)) for plain objects
// and creates a new Set for Set instances.
function makeClone(obj) {
  // Check if the object is an instance of Set
  return (obj instanceof Set)
    // If it's a Set, create a new Set from its elements
    ? new Set(Array.from(obj))
    // Otherwise, use JSON serialization for deep cloning (handles plain objects/arrays)
    : JSON.parse(JSON.stringify(obj));
}

// Function to get the next integer from the input
function nextInt() {
  return myconv(next(), 1); // Uses myconv with conversion type 1 (parseInt)
}

// Function to get the next line as an array of strings (space-separated)
function nextStrArray() {
  return myconv(next(), 2); // Uses myconv with conversion type 2 (split by space)
}

// Function to get the next line as an array of integers (space-separated)
function nextIntArray() {
  return myconv(next(), 4); // Uses myconv with conversion type 4 (split by space and map to Number)
}

// Function to get the next line as an array of characters
function nextCharArray() {
  return myconv(next(), 6); // Uses myconv with conversion type 6 (split by character)
}

// Function to retrieve the next token/line from the input object
function next() {
  return obj.next(); // Delegates to the 'next' method of the 'obj'
}

// Function to check if there is more input available
function hasNext() {
  return obj.hasNext(); // Delegates to the 'hasNext' method of the 'obj'
}

// Initializes the input object structure with methods to consume input
function init(input) {
  // Returns an object containing the input list, current index, max length,
  // and methods to check for next input and retrieve it.
  return {
    list: input, // The array of input lines
    index: 0, // Current index for reading input
    max: input.length, // Total number of input lines
    // Checks if there are more lines to read
    hasNext: function () {
      return (this.index < this.max);
    },
    // Retrieves the next line and increments the index
    next: function () {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        // Throws an error if no more input is available
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Function to output to console (standard output)
function myout(s) {
  console.log(s);
}

// Function to output debug information to console error (standard error)
function myerr(s) {
  console.error('debug:' + require('util').inspect(s, false, null));
}

// The 'myconv' function: a versatile converter for input processing.
// The 'no' parameter determines the type of conversion to apply.
// - 1: Parses string to integer.
// - 2: Splits string by spaces into an array of strings.
// - 4: Splits string by spaces and converts parts to numbers.
// - 6: Splits string into an array of individual characters.
// - 7: Splits string into characters and converts them to numbers.
// - 8: Joins array elements with spaces.
// - 9: Joins array elements with newlines.
// - 0: Joins array elements without any separator.
// - default: Returns input as is.
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i); // Convert to integer
      case 2:
        return i.split(' '); // Split by space
      case 4:
        return i.split(' ').map(Number); // Split by space and map to Number
      case 6:
        return i.split(''); // Split into characters
      case 7:
        return i.split('').map(Number); // Split into characters and map to Number
      case 8:
        return i.join(' '); // Join with spaces
      case 9:
        return i.join('\n'); // Join with newlines
      case 0:
        return i.join(''); // Join without separator
      default:
        return i; // No conversion, return as is
    }
  } catch (e) {
    return i; // In case of error, return original input
  }
}

// Main function encapsulating the core logic of the problem
function Main() {

  // Read the integer N from input
  var N = nextInt();

  // Initialize a character variable L, possibly representing a starting state or direction
  var L = "S";

  // Read the next input as an array of characters
  var list = nextCharArray();

  // Initialize a 'check' array with a starting state
  var check = ["S"];

  // Loop N times to process each item in the 'list'
  for (var i = 0; i < N; i++) {
    // Conditional logic based on the current character in 'list'
    if (list[i] == "o") {
      // If the current 'list' character is "o"
      if (check[i] == "S") {
        // If the current 'check' state is "S"
        if (i == 0) {
          // If it's the first iteration, push L (which is "S")
          check.push(L);
        } else {
          // Otherwise, push the previous 'check' state
          check.push(check[i - 1]);
        }
      } else {
        // If the current 'check' state is not "S" (i.e., "W")
        if (check[i - 1] == "S") {
          // If the previous 'check' state was "S", push "W"
          check.push("W");
        } else {
          // Otherwise, push "S"
          check.push("S");
        }
      }
    } else {
      // If the current 'list' character is not "o" (i.e., "x")
      if (check[i] == "S") {
        // If the current 'check' state is "S"
        if (i == 0) {
          // If it's the first iteration, push "W"
          check.push("W");
        } else {
          // Otherwise, nested condition based on previous 'check' state
          if (check[i - 1] == "S") {
            // If previous was "S", push "W"
            check.push("W");
          } else {
            // Otherwise, push "S"
            check.push("S");
          }
        }
      } else {
        // If the current 'check' state is not "S" (i.e., "W")
        // Push the previous 'check' state
        check.push(check[i - 1]);
      }
    }
  }

  // After the loop, check the final state
  if (check[N] == L) {
    // If the N-th element of 'check' matches L
    check.pop(); // Remove the last element
    myout(check.join("")); // Join the remaining elements and output
  } else {
    // If they don't match, output -1
    myout(-1);
  }
}