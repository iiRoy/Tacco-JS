// This section handles input/output setup and utility functions.
// It's generally boilerplate for competitive programming environments.
var read = require('readline').createInterface({
  input : process.stdin,
  output : process.stdout
});



var obj; // Global object to hold parsed input data.
var inLine = []; // Array to store each line read from stdin.



// Event listener for each line of input received.
read.on('line',
  function (input)
  {
    inLine.push(input);
  }
);


// Event listener for when input stream closes.
read.on('close',
  function() {

    obj = init(inLine); // Initialize the input object.

    // A little visual separator for error output.
    console.error("\n");

    var start = Date.now(); // Record start time for performance measurement.

    Main(); // Execute the main logic of the program.

    var end = Date.now() - start; // Calculate elapsed time.

    myerr("time : " + (end) + "ms"); // Output execution time.

    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Output memory usage.
  }
);



/*
 * Creates a deep clone of an object using JSON serialization.
 * Note: This method has limitations (e.g., doesn't handle functions, Dates, RegExps).
 */
function makeClone(obj)
{
  return JSON.parse(JSON.stringify(obj));
}



// Helper function to get the next integer from input.
function nextInt()
{
  return myconv(next(), 1);
}

// Helper function to get the next string array from input (split by space).
function nextStrArray()
{
  return myconv(next(), 2);
}

// Helper function to get the next integer array from input (split by space).
function nextIntArray()
{
  return myconv(next(), 4);
}

// Helper function to get the next character array from input.
function nextCharArray()
{
  return myconv(next(), 6);
}



// Retrieves the next token from the input object.
function next()
{
  return obj.next();
}

// Checks if there are more tokens available in the input.
function hasNext()
{
  return obj.hasNext();
}



/*
 * Initializes the input object with helper methods for parsing.
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with methods to consume input.
 */
function init(input)
{
  return {
    list: input,
    index: 0, // Current position in the input list.
    max: input.length, // Total number of input lines.

    // Checks if there's more input available.
    hasNext: function()
    {
      return (this.index < this.max);
    },

    // Retrieves the next line of input. Throws an error if no more input.
    next: function()
    {
      if (this.hasNext())
      {
        return this.list[this.index++];
      }
      else
      {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}



// Outputs a string to standard output, followed by a newline.
function myout(s)
{
  console.log(s);
}



// Outputs debug information to standard error.
// Uses util.inspect for better object representation.
function myerr(s)
{
  console.error("debug:" + require("util").inspect(s, false, null));
}


// This comment describes the 'no' parameter for the myconv function.
// The 'no' parameter dictates the type of conversion to be performed on the input 'i'.
//
// param "no" is defined as follows:
// unknown or outlier : return i as is.
// 1: parseInt - Converts to an integer.
// 2: split space - Splits the string by spaces into an array of strings.
// 4: split space and parseInt - Splits by spaces and converts each part to a number.
// 6: split 1 character - Splits the string into an array of individual characters.
// 7: split 1 character and parseInt - Splits by characters and converts each to a number.
// 8: join space - Joins an array of strings with spaces.
// 9: join nextline - Joins an array of strings with newlines.
// 0: join no character - Joins an array of strings without any separator.
function myconv(i, no)
{
  try
  {
    switch (no)
    {
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
        return i; // Fallback: if 'no' is unrecognized, return input as is.
    }
  }
  catch (e)
  {
    // In case of any conversion error, return the original input.
    return i;
  }
}


// This is the main function where the program's primary logic resides.
// It uses the custom output function `myout` to print several strings.
function Main()
{
  myout("aaa");
  myout("aab");
  myout("aba");
  myout("abb");
  myout("abc");
}