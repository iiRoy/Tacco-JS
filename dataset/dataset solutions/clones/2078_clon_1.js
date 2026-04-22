/*
 * This is a Type I clone generated from the original JavaScript code.
 * The purpose is to demonstrate variations in whitespace and comments
 * while keeping the core logic and structure absolutely identical.
 *
 * All identifiers, variable names, function names, operators, and
 * expressions are preserved exactly as they were in the source code.
 *
 * Changes are limited to:
 * - Adding, removing, or modifying comments.
 * - Adjusting indentation levels.
 * - Adding or removing blank lines.
 * - Modifying spacing around operators, keywords, and punctuation.
 */

// --- Start of boilerplate / utility code that is not the main focus ---

/*
 * Initialize the readline interface for standard input/output.
 * This setup allows the program to read input line by line.
 */
var     read = require(  'readline'  ).createInterface(
  {
    input  :
    process.stdin,
    output :
    process.stdout
  }
);


// Declare variables for storing input and parsed objects.
var obj;
var inLine = [];

// Event handler for each line of input received.
read.on('line' , function (  input  ) {
  inLine.push(input);
}
);

// Event handler for when the input stream closes.
read.on('close' , function (  ) {

  obj = init(inLine); // Initialize the input object from collected lines.

  console.error("\n"); // Output a blank line to standard error for separation.

  var start = Date.now(); // Record the start time for performance measurement.

  Main(); // Execute the main logic of the program.

  var end = Date.now() - start; // Calculate elapsed time.

  // Log performance metrics.
  myerr(  "time : " + (end) + "ms"  );
  myerr(  "memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"  );
}
);


// Helper function to create a deep clone of an object.
function makeClone(  obj  ) {
  return JSON.parse(  JSON.stringify(obj)  );
}

// Utility functions for parsing various types of input from the 'obj' reader.
function nextInt(  ) {
  return myconv(  next() , 1  );
}

function nextStrArray(  ) {
  return myconv(  next() , 2  );
}

function nextIntArray(  ) {
  return myconv(  next() , 4  );
}

function nextCharArray(  ) {
  return myconv(  next() , 6  );
}


// Core input reading functions.
function next(  ) {
  return obj.next();
}
function hasNext(  ) {
  return obj.hasNext();
}

/**
 * Initializes the input object with a list of lines.
 * Provides methods to check for more input and retrieve the next line.
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with methods for input traversal.
 */
function init(  input  ) {
  return {
    list : input,
    index : 0,
    max : input.length,

    // Checks if there are more lines to read.
    hasNext : function (  ) {
      return (this.index < this.max);
    },

    // Retrieves the next line of input and advances the internal pointer.
    next : function (  ) {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}


// Function to output messages to standard output (console.log).
function myout(  s  ) {
  console.log(s);
}

// Function to output debug messages to standard error (console.error).
function myerr(  s  ) {
  console.error("debug:" + require("util").inspect(s, false, null));
}

/*
 * myconv function: converts input `i` based on the `no` parameter.
 * `no` parameter guide:
 *   - 1: Parse as integer.
 *   - 2: Split by space into a string array.
 *   - 4: Split by space and map to numbers (integer array).
 *   - 6: Split into a character array.
 *   - 7: Split into a character array and map to numbers.
 *   - 8: Join array elements with space.
 *   - 9: Join array elements with newline.
 *   - 0: Join array elements with no character.
 *   - Default: Return input as is.
 */
function myconv(  i , no  ) {
  try {
    switch (  no  ) {
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
  } catch (  e  ) {
    return i;
  }
}

// --- End of boilerplate / utility code ---

/**
 * The main function of the application.
 * This is where the primary logic of the program resides.
 */
function Main(  ) {

  myout("aaa");
  myout("aab");
  myout("abb");
  myout("abc");

}