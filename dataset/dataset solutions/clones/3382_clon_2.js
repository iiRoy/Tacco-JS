/*
 * This module processes incoming textual information
 * to perform a specific numerical computation.
 */
function ProcessInput(sourceText) {
  // Split the entire input block into individual lines.
  const textLines = sourceText.split("\n");

  // Extract the first numerical parameter from the first line.
  const groupSize = parseInt(textLines[0].split(" ")[0], 10);
  // Extract the second numerical parameter from the first line.
  let originalValue = parseInt(textLines[0].split(" ")[1], 10);

  // Initialize an array to store prime factor data.
  const primeFactorData = [];
  // Calculate an upper bound for factor testing.
  const upperBound = Math.ceil(originalValue / 2);

  // Initialize indices and counters for factor tracking.
  let currentFactorPos = -1;
  let occurrenceCounter = 0;

  // Iterate to find prime factors of the original value.
  for (let testDivisor = 2; testDivisor < upperBound;) {
    // Check if the current test divisor evenly divides the value.
    if (originalValue % testDivisor === 0) {
      // If this is the first occurrence of a new factor, increment its position.
      if (occurrenceCounter === 0) {
        currentFactorPos++;
      }
      // Increment the count for the current factor.
      occurrenceCounter++;
      // Store the factor and its count in the data array.
      primeFactorData[currentFactorPos] = [testDivisor, occurrenceCounter];
      // Reduce the original value by dividing it by the found factor.
      originalValue = originalValue / testDivisor;
    } else {
      // If not a factor, move to the next potential divisor.
      testDivisor++;
      // Reset the occurrence counter as it's a new potential factor.
      occurrenceCounter = 0;
    }
    // If the original value has been completely factored down to 1, exit the loop.
    if (originalValue === 1) {
      break;
    }
  }

  // Initialize the final computed product.
  let computedProduct = 1;

  // Iterate through the collected prime factor data.
  for (let idx = 0; idx < primeFactorData.length; idx++) {
    // Retrieve the factor and its count.
    const factorBase = primeFactorData[idx][0];
    const factorExponent = primeFactorData[idx][1];

    // Calculate the power based on group size and factor exponent,
    // ensuring the minimum value is 1, then multiply to the product.
    computedProduct *= Math.max(
      Math.pow(factorBase, Math.floor(factorExponent / groupSize)),
      1
    );
  }

  // Display the final calculated result.
  console.log("%s", computedProduct);
}

/*
 * Utility function for local testing within a browser environment.
 * Executes the main processing logic with data from a UI element.
 */
function runLocalTest() {
  const testInputContent = document.querySelector("#input").value;
  ProcessInput(testInputContent);
}

// Execute the primary data processing function using standard input.
ProcessInput(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));