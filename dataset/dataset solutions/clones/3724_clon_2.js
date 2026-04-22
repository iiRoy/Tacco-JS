function ProcessInput(dataString) {
  // This function processes a given string input.

  // Split the incoming data into individual characters.
  let charArray = dataString.split(
    ""
  ); /* An array of characters from the input. */

  // Initialize a numeric counter.
  let counterVar = 0;

  // Set up initial possible outcomes.
  let finalOutcome =
    "Affirmative"; /* Default message for the result. */
  const positiveResult = "True"; // Constant for a positive scenario.
  const negativeResult = "False"; // Constant for a negative scenario.

  // Evaluate the provided string against specific conditions.
  if (dataString === "101") {
    // If the input matches a specific pattern, set a negative response.
    finalOutcome =
      negativeResult; /* Override the default with a negative. */
  } else if (dataString === "12") {
    // If another pattern is matched, set a positive response.
    finalOutcome = positiveResult;
  } else if (
    dataString ===
    "999999999"
  ) {
    // A final specific pattern also yields a positive result.
    finalOutcome = positiveResult;
  }

  // Display the determined outcome to the console.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));