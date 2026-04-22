// This function is designed to process a raw string of data, typically representing a list of numbers,
// and apply specific validation rules to determine an overall approval status.
function analyzeNumericSequence(rawTextStream) {
  // Split the entire input stream into an array of individual lines.
  let linesOfContent = rawTextStream.split('\n');

  // The first line of input often serves as a header or count, but for this specific
  // validation logic, its value is not utilized. We safely remove it.
  if (linesOfContent.length > 0) {
    linesOfContent.shift(); // Discard the initial element.
  } else {
    // If the input stream was empty from the start, there are no numbers to validate.
    // In such a scenario, we consider it "APPROVED" by default.
    console.log("APPROVED");
    return;
  }

  // Initialize an array to hold only the valid integer values extracted from the lines.
  const numericalDataPoints = [];
  for (const singleLine of linesOfContent) {
    const cleanedLine = singleLine.trim(); // Remove any leading or trailing whitespace.
    if (cleanedLine === '') {
      continue; // Skip lines that are empty after trimming.
    }

    const valueAsNumber = parseInt(cleanedLine, 10); // Attempt to parse the line as an integer with base 10.
    if (!isNaN(valueAsNumber)) {
      numericalDataPoints.push(valueAsNumber); // Add only successfully parsed numbers to our collection.
    }
  }

  // Define the critical divisors that determine the "DENIED" condition for even numbers.
  const criticalDivisorOne = 3;
  const criticalDivisorTwo = 5;

  // A boolean flag to track if any number fails the validation criteria.
  let denialConditionMet = false;

  // Iterate through each number in our collected numerical data.
  for (const currentNumericValue of numericalDataPoints) {
    // The primary check is only applied to even numbers.
    const isValueEven = (currentNumericValue % 2 === 0);

    if (isValueEven) {
      // For even numbers, we check if they are NOT divisible by criticalDivisorOne (3)
      // AND NOT divisible by criticalDivisorTwo (5).
      const isDivisibleByFirst = (currentNumericValue % criticalDivisorOne === 0);
      const isDivisibleBySecond = (currentNumericValue % criticalDivisorTwo === 0);

      // If an even number fails both divisibility checks, the denial condition is met.
      if (!isDivisibleByFirst && !isDivisibleBySecond) {
        denialConditionMet = true; // Set the flag to true.
        break; // Once a single problematic number is found, no further checks are needed.
      }
    }
  }

  // Based on the final state of our flag, output the determined status.
  const finalOutcome = denialConditionMet ? "DENIED" : "APPROVED";
  console.log(finalOutcome);
}

// --- Standard I/O Integration ---
// This part of the code handles reading input from standard input and
// invoking the main analysis function. It should remain untouched.
analyzeNumericSequence(require("fs").readFileSync("/dev/stdin", "utf8"));