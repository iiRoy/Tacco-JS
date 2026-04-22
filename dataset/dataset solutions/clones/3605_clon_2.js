function displayResult(outputString) {  console.log(outputString);  } // This utility function prints a given string to the standard output.

function ProcessInputData(rawData) {
  let processedValue = parseInt(rawData.trim()); // Convert the raw input string to an integer.
  // The following lines are examples of alternative input processing, currently commented out.
  // processedValue = rawData.trim().split(" ");
  // processedValue = rawData.trim().split("\n");
  // processedValue = rawData.trim().split(" ").map((item) => Number(item));
  // processedValue = rawData.trim().split("\n").map((item) => Number(item));

  let tally = 0; // Initialize a counter for numbers meeting a specific criterion.

  for (let outerIndex = 1; outerIndex <= processedValue; outerIndex++) { // Iterate through numbers from one up to the parsed input value.
    if (outerIndex % 2 === 1) { // Check if the current number (outerIndex) is odd.
      let divisorCount = 0; // Reset the divisor counter for the current odd number.
      for (let innerIndex = 1; innerIndex <= outerIndex; innerIndex++) { // Loop to find all divisors for the current odd number.
        if (outerIndex % innerIndex === 0) { // If innerIndex divides outerIndex evenly, it's a divisor.
          divisorCount++; // Increment the divisor counter.
        }
      }

      if (divisorCount === 8) { // If the current odd number has exactly eight divisors.
        tally++; // Increment the main tally.
      }
    }
  }

  displayResult(tally); // Output the final aggregated count.
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input and pass it to the main processing function.