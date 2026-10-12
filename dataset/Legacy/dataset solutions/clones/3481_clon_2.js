// This function processes the raw input data to determine a specific value.
function ProcessInput(rawData) {
  // Split the entire input string into an array of individual lines.
  let lines = rawData.split("\n");

  // The first line contains two space-separated numbers.
  let firstLineParts = lines[0].split(" ");

  // Convert the string parts to numeric values.
  let num1 = Number(firstLineParts[0]);
  let num2 = Number(firstLineParts[1]);

  // The second line is the first string.
  let strA = lines[1];
  // The third line is the second string.
  let strB = lines[2];

  // Calculate the least common multiple (LCM) of num1 and num2.
  // LCM(a, b) = (a * b) / GCD(a, b)
  let leastCommonMultiple = (num1 * num2) / calculateGCD(num2, num1);

  // Initialize two empty strings to store extracted characters.
  let extractedA = String();
  let extractedB = "";

  // This variable appears to be unused but is kept for structural consistency.
  let tempString = "" + leastCommonMultiple + "\n\n";

  // Iterate through the first string, extracting characters at specific intervals.
  // The interval is LCM / num2.
  for (let idx = 0; idx < num1; idx += (leastCommonMultiple / num2)) {
    extractedA += strA[idx];
  }

  // Iterate through the second string, extracting characters at specific intervals.
  // The interval is LCM / num1.
  for (let idx = 0; idx < num2; idx += (leastCommonMultiple / num1)) {
    extractedB += strB[idx];
  }

  // Compare the two extracted strings.
  // If they are identical, return the calculated LCM. Otherwise, return -1.
  return extractedA === extractedB ? leastCommonMultiple : -0x1;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 * @param {number} val1 - The first integer.
 * @param {number} val2 - The second integer.
 * @returns {number} The greatest common divisor.
 */
function calculateGCD(val1, val2) {
  let remainder; // Variable to hold the remainder in division.

  // Ensure that val1 is greater than or equal to val2 for the algorithm.
  if (val1 < val2) {
    remainder = val1; // Temporarily store val1.
    val1 = val2;
    val2 = remainder;
  }

  // Apply the Euclidean algorithm.
  // The GCD is the last non-zero remainder.
  while ((remainder = val1 % val2) !== 0x0) {
    val1 = val2;
    val2 = remainder;
  }

  // When the loop terminates, val2 holds the GCD.
  return val2;
}

// Read input from standard input, process it, and print the result to standard output.
console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));
