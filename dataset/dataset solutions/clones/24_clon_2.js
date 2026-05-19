(function utilityFunctions(undefined) {
  // This function formats a floating-point number to a string with a specified precision.
  this.formatDecimal = function formatDecimal(value, radix, padding, precisionDigits) {
    // Calculate 10 raised to the power of precisionDigits for rounding.
    const powerOfTen = Math.pow(10, precisionDigits);
    // Round the value and convert it to a string.
    let integerString = "" + Math.round(value * powerOfTen);

    // If the rounded integer string is '0', return '0.' followed by 'precisionDigits' zeros.
    if (integerString === '0') {
      return '0.' + Array(precisionDigits + 1).fill('0').join('');
    }

    // Determine the length of the integer part before the decimal point.
    const integerLength = integerString.length - precisionDigits;

    // If the integer part length is 0 (e.g., 0.123), prepend "0."
    if (integerLength === 0) {
      return "0." + integerString.substr(integerLength, precisionDigits);
    }

    // Otherwise, insert the decimal point at the correct position.
    return integerString.substr(0, integerLength) + "." + integerString.substr(integerLength, precisionDigits);
  };
}).call(global);

(function arithmeticOps(undefined) {
  // Computes the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
  this.greatestCommonDivisor = function greatestCommonDivisor(numA, numB) {
    return !numB ? numA : greatestCommonDivisor(numB, numA % numB);
  };

  // Computes the least common multiple (LCM) of two numbers.
  this.leastCommonMultiple = function leastCommonMultiple(numA, numB) {
    // LCM(a, b) = |a * b| / GCD(a, b)
    return (numA / greatestCommonDivisor(numA, numB)) * numB;
  };

  // Computes the square of a number.
  this.squareValue = function squareValue(inputVal) {
    return inputVal * inputVal;
  };
}).call(global);

(function(undefined) {
  'use strict'; // Enforce strict mode for cleaner code.

  (function initializeApplication() {
    // Expose a global function for logging output.
    this.displayResult = function() {
      console.log.apply(console, arguments);
    };

    // Open standard input stream.
    this.standardInput = process.openStdin();
    // Set encoding for the standard input.
    standardInput.setEncoding('utf8');

    // Initialize an array to store parsed input numbers.
    this.pendingInputs = [];

    // Event listener for incoming data chunks from stdin.
    standardInput.on('data', function(dataChunk) {
      // Extract all numbers (positive or negative integers) from the chunk.
      const parsedNumbers = dataChunk.match(/[-]?\d+/g);
      // Concatenate the extracted numbers to the pendingInputs list.
      pendingInputs = pendingInputs.concat(parsedNumbers);
    });

    // Event listener for the end of the stdin stream.
    standardInput.on('end', function() {
      // Once all data is received, start the processing.
      startProcessing();
    });

    // Function to retrieve and remove the next number from the input list.
    this.getNextInputNumber = function() {
      // Parse the first element of the spliced array as an integer.
      return parseInt(pendingInputs.splice(0, 1)[0]);
    };

    // Function to check if there are more inputs available.
    this.moreInputsAvailable = function() {
      // Returns true if the list is empty, false otherwise.
      return !pendingInputs.length;
    };
  }).call(this); // Call init function in the global context.

  (function problemSolver() {
    // Expose a global function to initiate the solving process.
    this.startProcessing = function() {
      // Schedule the solve function to run asynchronously.
      setTimeout(processNextPair, 0, this);
    };

    // The core solving logic.
    function processNextPair() {
      // Read two numbers from the input.
      const currentArguments = [getNextInputNumber(), getNextInputNumber()];
      // Calculate GCD and LCM and display them.
      displayResult(greatestCommonDivisor.apply(this, currentArguments), leastCommonMultiple.apply(this, currentArguments));

      // If there are no more inputs, schedule another call to solve.
      // This creates a loop that continues until all input is processed.
      if (!moreInputsAvailable()) {
        setTimeout(processNextPair, 0, this);
      }
    }
  }).call(this); // Call solver function in the global context.

}).call(global); // Call the main IIFE in the global context.
