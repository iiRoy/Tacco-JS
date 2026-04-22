// This function simulates an interaction process based on a sequence of characters.
// It calculates a final score by tracking the balance between two abstract resources.
const processGameStream = (inputStream) => {
  // Convert the input string into an array of individual character tokens.
  // Using Array.from for clarity in character processing.
  const tokenArray = Array.from(inputStream);

  // Initialize game state variables using 'let' for mutability.
  let accumulatedScore = 0; // Tracks the overall outcome or score.
  let alphaResourceCount = 0; // Represents the count of 'g'-like entities or "positive" slots.
  let betaResourceCount = 0;  // Represents the count of 'p'-like entities or "negative" slots.

  // Begin iterating through each character token in the sequence.
  // Using a for...of loop for modern iteration over iterable objects.
  for (const currentToken of tokenArray) {
    // A boolean flag to indicate if the beta resource is less than alpha,
    // which simplifies the conditional logic within the branches.
    const isBetaLessThenAlpha = betaResourceCount < alphaResourceCount;

    // Utilize an if-else if structure to handle different token types.
    if (currentToken === 'g') {
      // Case for 'g' token: This token typically contributes to alpha resources.
      if (isBetaLessThenAlpha) {
        // If there's an "excess" of alpha resources, this 'g' token
        // contributes positively to the score and consumes a beta slot.
        accumulatedScore++;
        betaResourceCount++;
      } else {
        // Otherwise, this 'g' token simply adds to the alpha resource pool.
        alphaResourceCount++;
      }
    } else if (currentToken === 'p') {
      // Case for 'p' token: This token typically contributes to beta resources.
      if (isBetaLessThenAlpha) {
        // If there's an "excess" of alpha resources, this 'p' token
        // simply adds to the beta resource pool without affecting score.
        betaResourceCount++;
      } else {
        // Otherwise, this 'p' token contributes negatively to the score
        // and consumes an alpha slot.
        accumulatedScore--;
        alphaResourceCount++;
      }
    }
    // Any other characters found in the input stream are implicitly ignored (deleted)
    // by not having a 'default' case or an 'else' block here. This maintains original behavior.
  }

  // After processing all tokens, return the final calculated score.
  return accumulatedScore;
};

// This is the main execution entry point for the program.
const runSimulationAndDisplay = () => {
  // Attempt to read the raw input data from standard input.
  // Ensure it's decoded as UTF-8 and any surrounding whitespace is removed.
  const rawInputString = require("fs").readFileSync("/dev/stdin", "utf8").trim();

  // Introduce a guard clause: If the input string is empty after trimming,
  // log an error and terminate the execution gracefully.
  if (rawInputString.length === 0) {
    console.error("Error: No valid input provided for processing.");
    // Optionally, return a default score or throw an error. For this clone,
    // just logging and exiting is sufficient.
    return;
  }

  // Execute the core processing logic with the obtained input.
  const finalComputedValue = processGameStream(rawInputString);

  // Display the final result to the user using a template literal for clear output.
  console.log(`Simulation complete. The net outcome score is: ${finalComputedValue}`);
};

// Invoke the main execution function to start the simulation.
runSimulationAndDisplay();