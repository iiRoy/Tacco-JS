function ProcessInputData(rawTextContent) {
  // This function processes the provided raw text content.
  // It first trims any leading/trailing whitespace, then splits the string
  // into individual characters, and finally converts each character to an integer.
  const parsedDigits = rawTextContent.trim().split('').map(digitChar => parseInt(digitChar, 10));

  // Initialize a counter for a specific digit.
  let countOfNines = 0;

  // Iterate through the array of parsed digits.
  for (let currentIdx = 0; currentIdx < parsedDigits.length; currentIdx++) {
    // Check if the current digit is equal to 9.
    if (parsedDigits[currentIdx] === 9) {
      // If it is, increment the counter.
      countOfNines += 1;
    } else {
      // Otherwise, add zero (effectively doing nothing, but maintaining original structure).
      countOfNines += 0;
    }
  }

  // Based on the final count, print a specific message to the console.
  if (countOfNines !== 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
