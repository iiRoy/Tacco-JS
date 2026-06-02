function processInput(dataLines) {
  // Parse the first line of input to extract two numerical values.
  // The first value, 'countA', is read but not utilized in the subsequent calculations.
  let countA = dataLines[0].split(" ")[0] - 0;
  // The second value, 'upperBound', is a critical parameter for the final computation.
  let upperBound = dataLines[0].split(" ")[1] - 0;

  // Process the second line of input:
  // 1. Split the string by spaces to get individual number strings.
  // 2. Map each string to its numerical value, then divide it by two.
  const halfValues = dataLines[1].split(" ").map(val => val / 2);

  // Compute the least common multiple (LCM) for the array of 'halfValues'.
  const commonMultiple = calculateLCM(halfValues);

  // Perform the final calculation using 'upperBound' and 'commonMultiple',
  // then print the integer result to the standard output.
  console.log(Math.trunc(upperBound / commonMultiple) - Math.trunc(upperBound / (commonMultiple * 2)));
}

// This auxiliary function determines the least common multiple (LCM) for an array of numbers.
function calculateLCM(numberArray) {
    // Create a local reference to the input array for clarity.
    const currentNumbers = numberArray;

    // Define an inner helper function to compute the greatest common divisor (GCD)
    // of two numbers using the Euclidean algorithm.
    const findGCD = (val1, val2) => {
        // The base case for the recursion: if val2 is zero, val1 is the GCD.
        // Otherwise, recursively call with val2 and the remainder of val1 divided by val2.
        return val2 ? findGCD(val2, val1 % val2) : val1;
    };

    // Define another inner helper function to compute the LCM of two numbers.
    // The formula used is: LCM(a, b) = (a * b) / GCD(a, b).
    const computeLCM = (numA, numB) => {
        return (numA * numB) / findGCD(numA, numB);
    };

    // Initialize the result for the LCM with the first element of the array.
    let resultLCM = currentNumbers[0];

    // Iterate through the array starting from the second element.
    // In each step, update the 'resultLCM' by computing the LCM of the current 'resultLCM'
    // and the next number in the array.
    for (let idx = 1; idx < currentNumbers.length; idx++) {
        resultLCM = computeLCM(resultLCM, currentNumbers[idx]);
    }

    // Return the final calculated least common multiple.
    return resultLCM;
}

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, split it into an array of lines,
// and then pass this array to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
