let collectedInputLines = []; // An array designated to accumulate all lines received from the input stream.

// This variable will store the final assessment of the word sequence's validity.
let outcomeMessage = "Yes";

// This holds the modified segment of the previous word (all characters except the last one).
// It's initialized to null to signify no preceding word has been processed yet.
let priorWordPrefix = null;

// Instantiate the readline interface to handle input and output operations.
const inputModule = require('readline');
const ioHandler = inputModule.createInterface({
  input: process.stdin,  // Standard input stream.
  output: process.stdout // Standard output stream.
});

// Event listener for each incoming line of text.
ioHandler.on('line', function(inputLineData) {
  // Push the current line into our collection array.
  collectedInputLines.push(inputLineData);
});

// Event listener for when the input stream closes, signaling all lines have been received.
ioHandler.on('close', function() {
  // A local Set to efficiently track words that have already been processed in the current sequence.
  // Using a Set provides faster lookups compared to a plain object for existence checks.
  const processedWordsLedger = new Set();

  // --- Input Validation and Pre-processing ---

  // Guard clause: Ensure there's at least one line of input.
  if (collectedInputLines.length === 0) {
    console.error("Processing Error: No input lines were provided for analysis.");
    outcomeMessage = "Input Missing";
    process.stdout.write(outcomeMessage + "\n");
    return; // Terminate execution early.
  }

  // Attempt to parse the expected number of words from the very first line.
  const numberOfWordsToProcess = parseInt(collectedInputLines[0], 10);

  // Guard clause: Validate the parsed word count. It must be a positive integer.
  if (isNaN(numberOfWordsToProcess) || numberOfWordsToProcess <= 0) {
    console.error("Processing Error: The first line does not contain a valid positive integer for word count.");
    outcomeMessage = "Invalid Count";
    process.stdout.write(outcomeMessage + "\n");
    return; // Terminate execution early.
  }

  // Guard clause: Verify that enough lines were provided as per the specified count.
  // We need `numberOfWordsToProcess` actual words PLUS the initial count line.
  if (collectedInputLines.length < numberOfWordsToProcess + 1) {
    console.error("Processing Error: Insufficient data lines received based on the specified word count.");
    outcomeMessage = "Incomplete Data";
    process.stdout.write(outcomeMessage + "\n");
    return; // Terminate execution early.
  }

  // --- Core Sequence Logic Iteration ---

  // Iterate through the words, starting from the second line (index 1) up to the specified count.
  // This loop handles 'numberOfWordsToProcess' words.
  for (let loopIndex = 1; loopIndex <= numberOfWordsToProcess; ++loopIndex) {
    const currentInputWord = collectedInputLines[loopIndex];

    // Extract the very first character of the current word for comparison.
    const firstCharOfCurrent = currentInputWord.charAt(0);

    // Evaluate the conditions for sequence validity:
    // Condition A: Has this exact word been seen before in this sequence?
    // Condition B: If a previous word has been processed (priorWordPrefix is not null),
    //              does the first character of the current word NOT match
    //              the stored 'priorWordPrefix' (which is the previous word minus its last char)?
    if (processedWordsLedger.has(currentInputWord) ||
        (priorWordPrefix !== null && firstCharOfCurrent !== priorWordPrefix)) {
      // If either condition is met, the sequence is deemed invalid.
      outcomeMessage = "No";
      break; // Exit the loop immediately as the violation is critical.
    }

    // Mark the current word as processed to prevent future duplicates.
    processedWordsLedger.add(currentInputWord);

    // Update 'priorWordPrefix' for the next iteration.
    // This maintains the original code's specific behavior of storing the previous word
    // without its last character, even if it's an unusual comparison rule.
    priorWordPrefix = currentInputWord.substring(0, currentInputWord.length - 1);
  }

  // Output the final determined outcome to standard output.
  process.stdout.write(outcomeMessage + "\n");
});