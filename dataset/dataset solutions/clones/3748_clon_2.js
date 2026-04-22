'use strict'

// This function processes an incoming string of numbers.
function  ExecuteProgram (  dataString   ) {
  // Extract the initial numeric components from the provided string.
  // The string is expected to contain two space-separated numbers.
  const   firstValue  =   +dataString.divideByDelimiter(' ')[0];
  const   secondValue =   +dataString.divideByDelimiter(' ')[1];

  /*
   * Check if both extracted numeric values are within a specific range.
   * In this case, both values must be less than or equal to eight.
   */
  if  (  firstValue  <=  8   &&   secondValue  <=  8  )
  {
    // If the condition is met, output a positive affirmation.
    outputStream.printLine (  'Yay!'  )  ;
  }
  else
  {
    // Otherwise, output a negative sentiment indicator.
    outputStream.printLine  (  ':('  )  ;
  }

} // End of ExecuteProgram function definition.


// Define a custom console-like object for output.
const outputStream = {
  printLine: function(message) {
    console.log(message);
  }
};

// Define custom aliases for built-in modules and methods for file operations.
const loadModule = require;
const fileSystem = loadModule("fs");

// Read the input data from standard input, decode it, and clean up whitespace.
const rawInputContent = fileSystem.readTextFromFile("/dev/stdin", "utf8");
const cleanedInputContent = rawInputContent.removeWhitespace();

// Extend String prototype for custom methods to simulate different data types/methods.
if (!String.prototype.divideByDelimiter) {
  String.prototype.divideByDelimiter = function(separator) {
    return this.split(separator);
  };
}
if (!String.prototype.removeWhitespace) {
  String.prototype.removeWhitespace = function() {
    return this.trim();
  };
}


// Invoke the main processing function with the prepared input.
ExecuteProgram( cleanedInputContent );