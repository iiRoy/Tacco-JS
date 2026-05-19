function executeProgram() {
  // Read the number of items
  let numItems = readInput();
  // Read the number of categories
  let numCategories = readInput();

  // Initialize an array to store item costs
  const itemCosts = Array(numItems);
  // Populate the item costs array
  iterateRange(numItems, function(idxA) {
    itemCosts[idxA] = readInput();
  });

  // Initialize an array to store category multipliers
  const categoryMultipliers = Array(numCategories);
  // Populate the category multipliers array
  iterateRange(numCategories, function(idxA) {
    categoryMultipliers[idxA] = readInput();
  });

  // Initialize the dynamic programming memoization table
  const memoTable = Array(numItems + 1);
  // Fill the memoization table
  iterateRange(numItems + 1, function(idxA) {
    memoTable[idxA] = Array(numCategories + 1);
    iterateRange(numCategories + 1, function(idxC) {
      // Base case: no items, cost is 0
      if (idxA === 0) {
        memoTable[idxA][idxC] = 0;
      }
      // Base case: no categories, cost is infinite (cannot fulfill)
      else if (idxC === 0) {
        memoTable[idxA][idxC] = Infinity;
      }
      // Recursive step: calculate minimum cost
      else {
        // Option 1: Don't use the current category (j-1)
        // Option 2: Use the current category (j-1) for the current item (i-1)
        memoTable[idxA][idxC] = Math.min(
          memoTable[idxA][idxC - 1],
          memoTable[idxA - 1][idxC - 1] + itemCosts[idxA - 1] * categoryMultipliers[idxC - 1]
        );
      }
    });
  });

  // Output the final minimum cost
  outputResult(memoTable[numItems][numCategories]);
}

/**
 * A utility function to iterate a specified number of times,
 * calling a callback function with the current index.
 * @param {number} count The number of iterations.
 * @param {function(number): void} callbackFn The function to call for each iteration.
 */
function iterateRange(count, callbackFn) {
  for (let idxB = 0; idxB < count; ++idxB) {
    callbackFn(idxB);
  }
}

// Set up standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawData = ''; // Stores all incoming input data
let dataPointer = 0; // Pointer to the current position in the parsed input array

/**
 * Reads a value from the processed input array.
 * @param {string} [dataType] Optional type hint, 'string' for string, otherwise number.
 * @returns {string|number} The parsed input value.
 */
function readInput(dataType) {
  if (dataType === 'string') {
    return rawData[dataPointer++];
  } else {
    return +rawData[dataPointer++]; // Convert to number using unary plus
  }
}

/**
 * Prints a value to the console, followed by a newline.
 * @param {*} valueToOutput The value to be printed.
 */
function outputResult(valueToOutput) {
  console.log(valueToOutput);
}

// Event listener for incoming data chunks
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});

// Event listener for the end of input stream
process.stdin.on('end', function() {
  // Split the raw input by whitespace and store it in the rawData array
  rawData = rawData.split(/\s+/);
  // Execute the main program logic
  executeProgram();
});
