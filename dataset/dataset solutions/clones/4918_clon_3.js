function computeGameScore(gameDataPayload) {
  // Validate the initial input: ensure it's not null, undefined, or an empty string.
  if (!gameDataPayload || typeof gameDataPayload !== 'string' || gameDataPayload.trim().length === 0) {
    console.error("Input processing error: The provided game data payload is empty or invalid.");
    return; // Exit if input is not usable.
  }

  // Split the raw input into an array of lines.
  // The problem typically uses only the first line for the main sequence.
  const parsedInputLines = gameDataPayload.split('\n');

  // Extract the primary character sequence from the first line.
  // Trim any leading/trailing whitespace from this specific line.
  const mainCharacterSequence = parsedInputLines[0] ? parsedInputLines[0].trim() : '';

  // If, after trimming, the main sequence is empty, output a default score.
  if (mainCharacterSequence.length === 0) {
    console.log(0); // An empty sequence results in a score of zero.
    return;
  }

  // Define the specific character that incurs a penalty.
  const characterCausingPenalty = 'p';
  // Initialize a variable to accumulate the total penalty points.
  let accumulatedPenaltyPoints = 0;

  // Iterate through each character of the main sequence to count penalties.
  // Using a modern 'for...of' loop for direct character access.
  for (const currentSymbol of mainCharacterSequence) {
    // Check if the current character matches the penalty-inducing character.
    if (currentSymbol === characterCausingPenalty) {
      accumulatedPenaltyPoints -= 1; // Each 'p' character reduces the score by one.
    }
  }

  // Calculate the base score, which is half the length of the sequence, rounded down.
  const sequenceLength = mainCharacterSequence.length;
  const primaryScoreComponent = Math.floor(sequenceLength / 2);

  // Determine the final score by adding the base component and the accumulated penalties.
  const finalComputedScoreValue = primaryScoreComponent + accumulatedPenaltyPoints;

  // Print the final calculated score to standard output.
  console.log(finalComputedScoreValue);
}

// This section is responsible for reading input from the standard input stream
// and passing it to the main processing function. It should typically remain
// untouched in competitive programming environments.
computeGameScore(require("fs").readFileSync("/dev/stdin", "utf8"));