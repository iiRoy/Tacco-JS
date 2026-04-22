/*
 *  This section contains boilerplate code for input/output handling.
 *  It is generally not relevant to the core logic of the problem.
 *  Developed by an expert in competitive programming setups.
 */
var read = require('readline') . createInterface(
  {
    input  :  process . stdin,
    output : process . stdout
  }
);

var obj;
var inLine = []; // Array to store all input lines

read.on('line', function(input){
  inLine.push(input); // Store each line as it's received
});

read.on('close', function(){
  obj = init(inLine); // Initialize the input reader object
  console.error("\n"); // Print a newline to stderr for visual separation
  
  var start = Date.now(); // Record start time for performance measurement
  Main(); // Execute the main logic of the program
  var end = Date.now() - start; // Calculate elapsed time
  
  myerr("time : " + (end) + "ms"); // Report execution time
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Report memory usage
});

// Utility function to create a deep clone of an object
function makeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Input parsing helper functions
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
 * Initializes an input reader object from an array of strings.
 * @param {Array<string>} input - An array of strings representing input lines.
 * @returns {object} An object with `hasNext` and `next` methods.
 */
function init(input) {
  var returnObj = {
    list  :  input, // The array of input lines
    index : 0, // Current position in the input array
    max   : input.length, // Total number of input lines

    hasNext : function() {
      return (this.index < this.max); // Check if there are more lines
    },

    next : function() {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input"; // Error if no more input
      } else {
        var returnInput = this.list[this.index++]; // Get current line and advance index
        return returnInput;
      }
    }
  };
  return returnObj;
}

// Outputs a string to standard output
function myout(s) {
  console.log(s);
}

// Outputs debug information to standard error
function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
}

/*
 *  myconv function: A versatile converter for input parsing and output formatting.
 *  'no' parameter defines the conversion type:
 *  - Unknown or outlier: Returns input 'i' as is.
 *  - 1: Parses 'i' as an integer (e.g., "123" -> 123).
 *  - 2: Splits 'i' by space into an array of strings (e.g., "a b c" -> ["a", "b", "c"]).
 *  - 4: Splits 'i' by space and maps each part to a number (e.g., "1 2 3" -> [1, 2, 3]).
 *  - 6: Splits 'i' into an array of characters (e.g., "abc" -> ["a", "b", "c"]).
 *  - 7: Splits 'i' into characters and maps each to a number (e.g., "123" -> [1, 2, 3]).
 *  - 8: Joins an array 'i' with spaces (e.g., [1, 2, 3] -> "1 2 3").
 *  - 9: Joins an array 'i' with newlines (e.g., ["a", "b"] -> "a\nb").
 *  - 0: Joins an array 'i' with no separator (e.g., ["a", "b"] -> "ab").
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
    return i; // In case of error, return original input
  }
}

/*
 *  End of boilerplate code.
 *  The following section contains the main problem-solving logic.
 */
function Main() {

  // Read the first line of input, which contains six integer parameters.
  var one = nextIntArray();

  // Extract and assign parameters with appropriate scaling for water components.
  var A = one[0] * 100; // Water A coefficient (grams)
  var B = one[1] * 100; // Water B coefficient (grams)
  var C = one[2];       // Sugar C coefficient (grams)
  var D = one[3];       // Sugar D coefficient (grams)
  var E = one[4];       // Max sugar ratio (percentage)
  var F = one[5];       // Max total weight (grams)

  var max = 0; // Stores the maximum concentration found
  var output = [0, 0]; // Stores [total_weight, sugar_weight] for max concentration

  var waterSet = new Set(); // Stores unique possible water amounts
  var soltSet = new Set();  // Stores unique possible sugar amounts

  var lmax = 3000; // An arbitrary upper limit for loop iterations, assuming coefficients are small enough

  /*
   *  Iterate to find all possible combinations of water and sugar amounts.
   *  The loops run up to 'lmax' to cover a reasonable range for coefficients A, B, C, D.
   */
  for (var i = 0; i <= lmax; i++) {
    for (var j = 0; j <= lmax; j++) {
      var water = A * i + B * j; // Calculate total water from A and B sources
      var solt = C * i + D * j;  // Calculate total sugar from C and D sources

      // If the water amount is within the total weight limit F, add to waterSet.
      if (water <= F) {
        waterSet.add(water);
      }
      // If the sugar amount is within the total weight limit F, add to soltSet.
      if (solt <= F) {
        soltSet.add(solt);
      }
    }
  }


  // Convert sets to arrays for easier iteration.
  var waterList = Array.from(waterSet);
  var soltList = Array.from(soltSet);

  /*
   *  Iterate through all possible combinations of water and sugar amounts
   *  to find the highest concentration that meets the criteria.
   */
  for (var i = 0; i < waterList.length; i++) {
    for (var j = 0; j < soltList.length; j++) {
      var water = waterList[i]; // Current water amount
      var solt = soltList[j];   // Current sugar amount

      // Check if total weight is within limit F and if sugar concentration is valid.
      if (water + solt <= F && check(water, solt, E)) {
        var sum = water + solt; // Total weight of solution

        if (sum === 0) {
          continue; // Avoid division by zero if both water and sugar are zero.
        }

        var noudo = solt * 100 / sum; // Calculate concentration (percentage)

        // If current concentration is higher than the maximum found so far, update.
        if (noudo > max) {
          max = noudo;     // Update max concentration
          output[0] = sum; // Update total weight
          output[1] = solt; // Update sugar weight
        }
      }
    }
  }

  // Output the result (total weight and sugar weight) joined by a space.
  myout(myconv(output, 8));

}

/**
 * Checks if the sugar amount is within the allowed concentration for a given water amount.
 * @param {number} water - The amount of water in grams.
 * @param {number} solt - The amount of sugar in grams.
 * @param {number} E - The maximum allowed sugar ratio (percentage) per 100g of water.
 * @returns {boolean} True if the sugar amount is valid, false otherwise.
 */
function check(water, solt, E) {
  var single = water / 100 * E; // Calculate max allowed sugar for 'water' amount
  return single >= solt; // Return true if current sugar is less than or equal to max allowed
}