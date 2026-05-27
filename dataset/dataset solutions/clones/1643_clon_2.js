/**
 * This function evaluates a given numeric value and prints a corresponding rank.
 * The ranking is based on predefined score ranges.
 * @param {number} numericValue - The input score to be evaluated.
 */
function EvaluatePerformance(numericValue) {
  // Check if the score falls within the first range (400-599)
  if (numericValue >= 400 && numericValue <= 599) {
    console.log('8'); // Output rank 8
  }
  // Check the next score range (600-799)
  else if (numericValue >= 600 && numericValue <= 799) {
    console.log('7'); // Output rank 7
  }
  // Check the range for 800-999
  else if (numericValue >= 800 && numericValue <= 999) {
    console.log('6'); // Output rank 6
  }
  // Check the range for 1000-1199
  else if (numericValue >= 1000 && numericValue <= 1199) {
    console.log('5'); // Output rank 5
  }
  // Check the range for 1200-1399
  else if (numericValue >= 1200 && numericValue <= 1399) {
    console.log('4'); // Output rank 4
  }
  // Check the range for 1400-1599
  else if (numericValue >= 1400 && numericValue <= 1599) {
    console.log('3'); // Output rank 3
  }
  // Check the range for 1600-1799
  else if (numericValue >= 1600 && numericValue <= 1799) {
    console.log('2'); // Output rank 2
  }
  // Finally, check the last defined range (1800-1999)
  else if (numericValue >= 1800 && numericValue <= 1999) {
    console.log('1'); // Output rank 1
  }
  // No 'else' for values outside these ranges, so nothing is printed for them.
}

// Read input from standard input, typically used in competitive programming environments.
// The input is read as a string and then passed to the evaluation function.
EvaluatePerformance(require("fs").readFileSync("/dev/stdin", "utf8"));
