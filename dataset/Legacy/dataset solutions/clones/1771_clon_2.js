function processInput(rawData) {
  // Parse the incoming string to extract two numerical components.
  let firstVal = rawData.split(" ")[0]; // The initial numerical component.
  let secondVal = rawData.split(" ")[1]; // The subsequent numerical component.

  // Compute an auxiliary value based on the parsed numbers.
  // This calculation is integral to the decision-making process.
  let intermediateResult = 2.0 * firstVal - secondVal / 2.0;

  // Evaluate specific conditions to determine the appropriate response.
  // The second number must be an even integer, and the calculated intermediate result must be non-negative.
  if (secondVal % 2 === 0 && intermediateResult >= 0.0) {
    console.log('Yes'); // Display 'Yes' if all criteria are satisfied.
  } else {
    console.log("No"); // Otherwise, display 'No'.
  }
}

// Acquire input from the standard input stream and pass it to the primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
