function parseInteger (inputString) {
  // Converts a string to an integer.
  return parseInt(inputString);
}

function parseDecimal (inputString) {
  // Converts a string to a floating-point number.
  return parseFloat(inputString);
}

function ProcessInput (rawData) {
  // Split the raw input into individual lines.
  const lines = rawData.split("\n");

  // Parse the first line for initial parameters.
  const initialParams = lines[0].split(' ').map(parseInteger);
  const numA = initialParams[0]; // Represents N from original
  const numB = initialParams[1]; // Represents M from original

  // Get the two strings from the input.
  const strA = lines[1]; // Represents S from original
  const strB = lines[2]; // Represents T from original

  /**
   * Computes the greatest common divisor (GCD) of two numbers.
   * @param {number} val1 - The first number.
   * @param {number} val2 - The second number.
   * @returns {number} The GCD of val1 and val2.
   */
  function calculateGCD (val1, val2) {
    let absoluteVal1 = Math.abs(val1);
    let absoluteVal2 = Math.abs(val2);
    while (absoluteVal2) {
      let tempVar = absoluteVal2;
      absoluteVal2 = absoluteVal1 % absoluteVal2;
      absoluteVal1 = tempVar;
    }
    return absoluteVal1;
  }

  /**
   * Computes the least common multiple (LCM) of two numbers.
   * @param {number} numX - The first number.
   * @param {number} numY - The second number.
   * @returns {number|boolean} The LCM of numX and numY, or false if inputs are not numbers.
   */
  function calculateLCM (numX, numY) {
    if ((typeof numX !== 'number') || (typeof numY !== 'number')) {
      return false; // Input validation
    }
    // LCM formula: |x*y| / GCD(x,y)
    return (!numX || !numY) ? 0 : Math.abs((numX * numY) / calculateGCD(numX, numY));
  }

  // Calculate the common step size using LCM.
  const commonMultipleStep = calculateLCM(numB, numA);

  // Check the first characters for an early exit condition.
  if (strA.charAt(0) !== strB.charAt(0)) {
    console.log(-1);
    return;
  }

  // Iterate through potential common lengths.
  for (let currentIteration = commonMultipleStep; currentIteration <= numA * numB; currentIteration += commonMultipleStep) {
    // Initialize a map to store characters at specific indices.
    let charMap = [];
    let hasConflict = false; // Flag to detect mismatches

    // Populate charMap based on strA.
    for (let innerIndex = 1; innerIndex < numA; innerIndex++) {
      charMap[innerIndex * currentIteration / numA] = strA.charAt(innerIndex);
    }

    // Check and populate charMap based on strB.
    for (let innerIndex = 1; innerIndex < numB; innerIndex++) {
      let targetChar = strB.charAt(innerIndex); // Character from strB

      // If an entry already exists in charMap for this position.
      if (charMap[innerIndex * currentIteration / numB]) {
        // Check for character mismatch.
        if (targetChar !== charMap[innerIndex * currentIteration / numB]) {
          hasConflict = true; // Conflict found
          break; // Exit inner loop
        }
      } else {
        // No entry, so add the character from strB.
        charMap[innerIndex * currentIteration / numB] = strB.charAt(innerIndex);
      }
    }

    // If a conflict was found, skip to the next iteration.
    if (hasConflict) {
      continue;
    }

    // If no conflict, this is the smallest common length.
    console.log(currentIteration);
    return; // Exit the function
  }

  // If no common length was found after all iterations.
  console.log(-1);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
