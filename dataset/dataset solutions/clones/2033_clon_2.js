function obtainRows(rawData) {
  // Splits the raw input string by newline characters and trims each resulting segment.
  return rawData.split("\n").map((segment) => segment.trim());
}

function processRow(currentLine) {
  // Divides a single line string into parts based on spaces, then cleans up each part.
  return currentLine.split(" ").map((segment) => segment.trim());
}

function processRowToNumeric(currentLine) {
  // Parses a line into an array of integers after splitting by space and trimming.
  return currentLine.split(" ").map((segment) => parseInt(segment.trim()));
}

/**
 * Main execution function for the program.
 * It processes input data, performs calculations, and outputs a result.
 * @param {string} programInput - The entire input data as a single string.
 */
function ExecuteProgram(programInput) {
  // The initial input string is processed into an array of arrays of integers.
  // The first element of the processed input array corresponds to the first line, and so on.
  programInput = obtainRows(programInput).map(processRowToNumeric);

  // Extracting various parameters from the first processed line.
  let alpha = programInput[0][0]; // Represents X from the problem description
  let beta = programInput[0][1];  // Represents Y from the problem description
  let gamma = programInput[0][2] - 1; // Represents A, adjusted for zero-based indexing
  let delta = programInput[0][3] - 1; // Represents B, adjusted for zero-based indexing
  let epsilon = programInput[0][4] - 1; // Represents C, adjusted for zero-based indexing

  // Assigning subsequent lines to distinct arrays.
  let firstArray = programInput[1]; // Corresponds to p
  let secondArray = programInput[2]; // Corresponds to q
  let thirdArray = programInput[3]; // Corresponds to r

  // Sort the first array in ascending order.
  firstArray.sort(function(elementA, elementB) {
    if (elementA > elementB) {
      return 1; // elementA comes after elementB
    }
    if (elementB > elementA) {
      return -1; // elementB comes after elementA
    }
    return 0; // elements are considered equal
  });

  // Sort the second array in ascending order.
  secondArray.sort(function(elementA, elementB) {
    if (elementA > elementB) {
      return 1;
    }
    if (elementB > elementA) {
      return -1;
    }
    return 0;
  });

  // Sort the third array in ascending order.
  thirdArray.sort(function(elementA, elementB) {
    if (elementA > elementB) {
      return 1;
    }
    if (elementB > elementA) {
      return -1;
    }
    return 0;
  });

  let finalResult = 0; // Initialize the accumulator for the final sum.

  // Sum the largest 'alpha' elements from the first array.
  // These are located at the end of the sorted array.
  for (let idx1 = 0; idx1 < alpha; idx1++) {
    finalResult += firstArray[gamma - idx1];
  }

  // Calculate the starting pointer for the first array for subsequent operations.
  // This pointer indicates the smallest element currently included in the sum from firstArray.
  let ptrA = gamma - alpha + 1;

  // Sum the largest 'beta' elements from the second array.
  // These are located at the end of the sorted array.
  for (let idx2 = 0; idx2 < beta; idx2++) {
    finalResult += secondArray[delta - idx2];
  }

  // Calculate the starting pointer for the second array for subsequent operations.
  // This pointer indicates the smallest element currently included in the sum from secondArray.
  let ptrB = delta - beta + 1;

  // Iterate through the third array from largest to smallest elements.
  // This loop attempts to replace smaller elements in the current sum (from firstArray or secondArray)
  // with larger elements from thirdArray to maximize the total sum.
  for (let idx1 = epsilon; idx1 >= 0; idx1--) {
    // If both pointers have exceeded their bounds, no more replacements are possible.
    if (ptrA > gamma && ptrB > delta) {
      break;
    }

    // Case 1: Only the first array pointer has exceeded its bound.
    // This means all 'alpha' elements from firstArray have been considered for replacement.
    if (ptrA > gamma) {
      // If the current element from the third array is greater than the current smallest element
      // pointed to in the second array, perform a replacement.
      if (thirdArray[idx1] > secondArray[ptrB]) {
        finalResult = finalResult + thirdArray[idx1] - secondArray[ptrB];
        ptrB++; // Move the second array pointer forward to the next smallest element.
        continue; // Proceed to the next iteration of the loop.
      } else {
        // If no improvement can be made with the current thirdArray element, stop.
        break;
      }
    }

    // Case 2: Only the second array pointer has exceeded its bound.
    // This means all 'beta' elements from secondArray have been considered for replacement.
    if (ptrB > delta) {
      // If the current element from the third array is greater than the current smallest element
      // pointed to in the first array, perform a replacement.
      if (thirdArray[idx1] > firstArray[ptrA]) {
        finalResult = finalResult + thirdArray[idx1] - firstArray[ptrA];
        ptrA++; // Move the first array pointer forward to the next smallest element.
        continue; // Proceed to the next iteration of the loop.
      } else {
        // If no improvement can be made with the current thirdArray element, stop.
        break;
      }
    }

    // Case 3: Both pointers are within bounds.
    // If the current element from the third array is greater than the minimum of
    // the elements pointed to in the first and second arrays.
    if (thirdArray[idx1] > Math.min(firstArray[ptrA], secondArray[ptrB])) {
      // Replace the smaller of the two elements (from firstArray or secondArray)
      // with the current element from thirdArray to maximize the sum.
      if (secondArray[ptrB] > firstArray[ptrA]) {
        finalResult = finalResult + thirdArray[idx1] - firstArray[ptrA];
        ptrA++; // Move the first array pointer.
      } else {
        finalResult = finalResult + thirdArray[idx1] - secondArray[ptrB];
        ptrB++; // Move the second array pointer.
      }
    } else {
      // If no improvement can be made with the current thirdArray element, stop.
      break;
    }
  }

  // Output the computed final result to the console.
  console.log(finalResult);
}

// The following lines are responsible for reading input and invoking the main function.
// They should not be altered as they handle the program's interaction with its environment.
// The commented-out line shows an alternative input method, typically for local testing.
// ExecuteProgram(require("fs").readFileSync(__dirname + '/input_data.txt', "utf8"));
ExecuteProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
