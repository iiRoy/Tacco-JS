function displayMessage(msgContent) {
  console.log(msgContent);
}

function ProcessInput(rawData) {
  // Parse the incoming string data into an integer value.
  let numericInput = parseInt(rawData);

  // Initialize a variable to hold the smallest sum of digits found so far.
  // Start with a large number to ensure any valid sum will be smaller.
  let finalResult = 1000000000;

  // Iterate through multipliers from 1 to 10.
  for (let idxA = 1; idxA <= 10; idxA++) {
    // Calculate the product, convert it to a string, split into individual characters,
    // and then convert each character back to a numeric digit.
    const tempDigits = (numericInput * idxA).toString().split("").map((digitChar) => Number(digitChar));

    // Calculate the sum of the digits for the current product.
    let currentSum = 0;
    for (let idxB = 0; idxB < tempDigits.length; idxB++) {
      currentSum += tempDigits[idxB];
    }

    // Update the finalResult if the current sum of digits is smaller than the previously recorded minimum.
    finalResult = Math.min(finalResult, currentSum);
  }

  // Output the computed minimum sum of digits.
  displayMessage(finalResult);
}

// Read input from standard input, remove any leading/trailing whitespace, and then invoke the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
