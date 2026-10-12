function ProcessInput(rawData) {
  // Split the raw input string by newline characters to get individual lines.
  let lines = rawData.split("\n");
  // The first line contains the two numbers, split them by space.
  let parsedLine = lines[0].split(" ");

  // Parse the first number as the left boundary of the range.
  const leftBound = Number.parseInt(parsedLine[0], 10);
  // Parse the second number as the right boundary of the range.
  const rightBound = Number.parseInt(parsedLine[1], 10);

  // This array is declared but not used in the original logic.
  let temporaryStorage = [];

  // Initialize the minimum remainder found so far with the left boundary value.
  let minimumRemainder = leftBound;

  // Check a primary condition: if the product of the bounds is greater than 2019.
  if (leftBound * rightBound > 2019) {
    // If the range (difference between right and left bounds) is less than 2019,
    // we need to iterate and find the minimum product modulo 2019.
    if (rightBound - leftBound < 2019) {
      // Outer loop: iterate 'firstNum' from 'leftBound' up to (but not including) 'rightBound'.
      for (let firstNum = leftBound; firstNum < rightBound; firstNum++) {
        // Inner loop: iterate 'secondNum' from 'firstNum + 1' up to (and including) 'rightBound'.
        for (let secondNum = firstNum + 1; secondNum < rightBound + 1; secondNum++) {
          // Calculate the product of the two numbers and then its remainder when divided by 2019.
          let currentProductMod = (firstNum * secondNum) % 2019;

          // If the remainder is 0, it's the smallest possible, so we can stop searching.
          if (currentProductMod === 0) {
            minimumRemainder = currentProductMod;
            break; // Exit the inner loop as 0 is the absolute minimum.
          } else {
            // If the current remainder is smaller than the previously found minimum, update it.
            minimumRemainder = currentProductMod < minimumRemainder ? currentProductMod : minimumRemainder;
          }
        }
      }
      // Output the final minimum remainder found.
      console.log(minimumRemainder);
    } else {
      // If the range is sufficiently wide (R - L >= 2019), it guarantees that
      // a pair of numbers will produce a product that is a multiple of 2019,
      // thus resulting in a remainder of 0.
      console.log(0);
    }
  } else {
    // If the product of L and R is not greater than 2019,
    // the problem specifies a different calculation for this case.
    // The original code calculates L * (L+1).
    console.log(leftBound * (leftBound + 1));
  }
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
