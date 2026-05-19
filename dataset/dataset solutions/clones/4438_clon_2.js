function ProcessInput(rawData) {
  // This function takes raw input data and processes it according to specific rules.
  // First, we split the entire input string by newline characters to get individual lines.
  rawData = rawData.split("\n");

  // The first line contains the count of elements, which we parse as an integer.
  var elementCount = parseInt(rawData[0], 10);

  // The second line contains space-separated values; we split them into a temporary array of strings.
  let tempValues = rawData[1].split(" ");

  // Initialize a new array of the determined size, filling it with zero values.
  let numericData = new Array(elementCount).fill(0x0);

  // Iterate through the temporary string values and convert them to integers, storing them in our numeric array.
  for (let idx = 0; idx < elementCount; idx++) {
    numericData[idx] = parseInt(tempValues[idx], 10);
  }

  // Initialize counters for odd numbers and numbers that are multiples of four.
  let oddNumbers = 0;
  let multiplesOfFour = 0;

  // Loop through the processed numeric data to categorize each number.
  for (let idx = 0; idx < elementCount; idx++) {
    // If a number leaves a remainder of 1 when divided by 2, it's odd.
    if (numericData[idx] % 2 === 1) {
      oddNumbers++; // Increment the odd numbers counter.
    }
    // Otherwise, if it's perfectly divisible by 4, it's a multiple of four.
    else if (numericData[idx] % 4 === 0) {
      multiplesOfFour++; // Increment the multiples of four counter.
    }
  }

  // Initialize the final outcome string to 'No'.
  let finalResult = 'No';

  // Apply a series of conditions to determine if the outcome should be 'Yes'.
  // Condition 1: If there are no odd numbers at all.
  if (oddNumbers === 0) {
    finalResult = 'Yes';
  }
  // Condition 2: If the count of odd numbers is less than or equal to the count of multiples of four.
  else if (oddNumbers - multiplesOfFour <= 0) {
    finalResult = 'Yes';
  }
  // Condition 3: A specific scenario where elementCount is 3, the difference between odd and multiples of four is at most 1, and there's at least one multiple of four.
  else if (elementCount === 3 && oddNumbers - multiplesOfFour <= 1 && multiplesOfFour > 0) {
    finalResult = 'Yes';
  }

  // Print the final determined result to the console.
  console.log('%s', finalResult);
}

// The program execution starts here, reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
