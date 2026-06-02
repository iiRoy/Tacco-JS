function processInput(rawData) {
  // Extract the first number from the initial line of input data.
  // Using parseInt for explicit type conversion from string to number.
  let countA = parseInt(rawData[0].split(" ")[0], 10);

  // Extract the second number from the initial line of input data.
  // This value represents an upper bound or limit.
  let limitB = parseInt(rawData[0].split(" ")[1], 10);

  // Parse the second line of input, splitting it by spaces
  // and converting each part into an integer to form a sequence.
  const numberSequence = rawData[1].split(" ").map(element => parseInt(element, 10));

  // Compute the least common multiple for all numbers in the sequence.
  const commonMultiple = calculateLCM(numberSequence);

  // Perform a specific calculation based on the limit and the common multiple,
  // then print the final integer result to the console.
  console.log(Math.floor(limitB / (commonMultiple / 2)) - Math.floor(limitB / commonMultiple));
}

/**
 * Calculates the Least Common Multiple (LCM) for an array of numbers.
 * @param {number[]} values - An array of integers.
 * @returns {number} The LCM of all numbers in the array.
 */
function calculateLCM(values) {
    // Create a local reference to the input array.
    const numArray = values;

    /**
     * Computes the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
     * @param {number} val1 - The first integer.
     * @param {number} val2 - The second integer.
     * @returns {number} The GCD of val1 and val2.
     */
    const findGCD = (val1, val2) => {
        // Base case: if val2 is 0, val1 is the GCD.
        return val2 === 0 ? val1 : findGCD(val2, val1 % val2);
    };

    /**
     * Computes the Least Common Multiple (LCM) of two numbers using their GCD.
     * LCM(a, b) = |a * b| / GCD(a, b)
     * @param {number} numX - The first integer.
     * @param {number} numY - The second integer.
     * @returns {number} The LCM of numX and numY.
     */
    const computeLCM = (numX, numY) => {
        // Ensure positive results for LCM, though input numbers are typically positive in such problems.
        return (Math.abs(numX * numY)) / findGCD(numX, numY);
    };

    // Initialize the running LCM with the first element of the array.
    let resultantLCM = numArray[0];

    // Iterate through the rest of the array elements,
    // continuously updating the resultantLCM.
    for (let idx = 1; idx < numArray.length; idx++) {
        resultantLCM = computeLCM(resultantLCM, numArray[idx]);
    }

    // Return the final calculated LCM for the entire array.
    return resultantLCM;
}

// Read input from standard input, decode as UTF-8,
// remove leading/trailing whitespace, and split into lines.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
