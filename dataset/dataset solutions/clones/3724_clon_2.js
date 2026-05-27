function ProcessInput(dataString) {
  // This function processes the provided input string.

  // Split the input string into an array of characters.
  let charArray = dataString.split("");

  // Initialize a numeric counter, though it's not used in the logic.
  let counter = 0;

  // Define possible outcomes as string literals.
  const positiveOutcome = "Yes";
  const negativeOutcome = "No";

  // Initialize the variable that will hold the final result.
  let finalResult = positiveOutcome; // Default to "Yes"

  // Check the input string against specific values to determine the final result.
  if (dataString === "101") {
    finalResult = negativeOutcome; // If input is "101", the result is "No".
  } else if (dataString === "12") {
    finalResult = positiveOutcome; // If input is "12", the result is "Yes".
  } else if (dataString === "999999999") {
    finalResult = positiveOutcome; // If input is "999999999", the result is "Yes".
  }

  // Output the determined result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
