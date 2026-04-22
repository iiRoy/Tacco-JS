// A module for interacting with the console I/O streams.
const consoleIO = require('readline');

// Establish standard input and output channels for the process.
const standardInChannel = process.stdin;
const standardOutChannel = process.stdout;

// Create an interface for handling input line by line.
// This abstraction allows for reading input from the console.
const inputProcessor = consoleIO.createInterface({
  input: standardInChannel,
  output: standardOutChannel
});

// Define the fixed, immutable reference sequence against which user input will be validated.
// This string represents the "CODEFESTIVAL2016" constant from the original context.
const referencePattern = "CODEFESTIVAL2016";

// Determine the exact character count of the reference pattern.
// This value sets the upper bound for our character-by-character comparison.
const comparisonLimit = referencePattern.length;

// Initiate the sequence validation process by prompting the user for input.
// The provided callback function will execute once the user submits their line.
inputProcessor.question('Please enter your text string for analysis: ', (receivedSequence) => {
  // Initialize a counter to track the number of character disparities.
  // This variable will accumulate mismatches found during the comparison phase.
  let divergenceCount = 0;

  // Convert the user's received input string into an array of individual characters.
  // This facilitates indexed access to each character for comparison.
  const userCharacterArray = receivedSequence.split('');

  // Similarly, convert the predefined reference pattern into an array of characters.
  // This allows for direct character-by-character comparison with the user's input.
  const patternCharacterArray = referencePattern.split('');

  // Record the actual length of the sequence provided by the user.
  const userSequenceLength = userCharacterArray.length;

  // Implement a preliminary check to alert if the input's length deviates from the expected reference length.
  // This serves as a validation or informative message, but the comparison proceeds regardless.
  if (userSequenceLength !== comparisonLimit) {
    console.warn(`NOTICE: Your input length (${userSequenceLength}) does not perfectly align with the reference length (${comparisonLimit}). Comparison will proceed up to the reference limit.`);
  }

  // Begin an iterative comparison loop, processing each character position up to the established comparison limit.
  // The loop variable 'currentPosition' tracks the index of the character being examined.
  for (let currentPosition = 0; currentPosition < comparisonLimit; ++currentPosition) {
    // Retrieve the character from the user's input at the current position.
    // If the input sequence is shorter than the reference, 'userCharacterArray[currentPosition]' would be undefined.
    // The '|| ""' ensures that 'undefined' is treated as an empty string, which will always result in a mismatch
    // against any non-empty reference character, effectively counting it as a divergence.
    const observedCharacter = userCharacterArray[currentPosition] || '';

    // Fetch the corresponding character from the reference pattern at the same position.
    const benchmarkCharacter = patternCharacterArray[currentPosition];

    // Evaluate if the observed character from the user's input differs from the benchmark character.
    if (observedCharacter !== benchmarkCharacter) {
      // If a discrepancy is identified, increment the divergence counter.
      // This step quantifies the total number of differing characters.
      divergenceCount = divergenceCount + 1;
    }
  }

  // Output the final tally of character divergences to the standard output channel.
  // The message provides a clear summary of the comparison result.
  standardOutChannel.write(`Final count of character dissimilarities: ${divergenceCount}\n`);

  // Conclude the input processing session, releasing any associated resources.
  inputProcessor.close();
});