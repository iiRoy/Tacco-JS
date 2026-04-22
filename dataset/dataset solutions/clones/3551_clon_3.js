const receivedInputSegments = []; // Buffer to hold each line read from the input stream.
let chainValidationOutcome = true; // Boolean flag to track the overall validity of the word chain.
let antecedentCharacter = ''; // Stores the last character of the previously processed word for comparison.

// Establish an interface to manage input and output streams.
const standardStreamHandler = require('readline').createInterface({
  input: process.stdin,  // Read from standard input.
  output: process.stdout // Write to standard output (though not directly used here for output).
});

// Callback for each line received from the input.
standardStreamHandler.on('line', (individualLine) => {
  // Append the current line to our collection of input segments.
  receivedInputSegments.push(individualLine);
});

// Callback executed once the entire input stream has been consumed.
standardStreamHandler.on('close', () => {
  // A local data structure to keep track of words that have already appeared.
  // Using a Set for efficient uniqueness checks.
  const previouslyEncounteredWords = new Set();

  // Guard clause for empty input.
  if (receivedInputSegments.length === 0) {
    console.log("No"); // If no input, it's not a valid chain.
    return;
  }

  // The very first line should contain the total count of words to be validated.
  const declaredWordCount = parseInt(receivedInputSegments[0], 10);

  // Input validation for the declared word count.
  if (isNaN(declaredWordCount) || declaredWordCount < 0) {
    chainValidationOutcome = false; // An invalid count immediately invalidates the chain.
  }

  // Special handling for a declared count of zero words.
  if (declaredWordCount === 0 && chainValidationOutcome) {
    console.log("Yes"); // An empty chain can be considered valid if no other issues.
    return;
  }

  // Iterate through the words, starting from the second line (index 1) up to the declared count.
  for (let currentWordIndex = 1; currentWordIndex <= declaredWordCount; ++currentWordIndex) {
    // If the chain has already been deemed invalid, cease further processing.
    if (!chainValidationOutcome) {
      break;
    }

    // Ensure we have enough input lines as declared by the first line.
    if (currentWordIndex >= receivedInputSegments.length) {
      chainValidationOutcome = false; // Not enough words provided.
      break;
    }

    // Extract and clean the current word from its raw input line.
    const rawWordString = receivedInputSegments[currentWordIndex];
    const sanitizedWord = rawWordString.trim(); // Removes leading/trailing whitespace, including newlines.

    // Validate that the word is not empty after sanitization.
    if (sanitizedWord.length === 0) {
      chainValidationOutcome = false; // Empty words are not allowed in the chain.
      break;
    }

    // Determine the first and last characters of the current word.
    const leadingChar = sanitizedWord.charAt(0);
    const trailingChar = sanitizedWord.charAt(sanitizedWord.length - 1);

    // Specific logic for the very first word in the sequence (index 1).
    if (currentWordIndex === 1) {
      // The first word only needs to be unique, not adhere to a preceding character rule.
      if (previouslyEncounteredWords.has(sanitizedWord)) {
        chainValidationOutcome = false; // Duplicate first word is an invalid chain.
        break;
      }
      previouslyEncounteredWords.add(sanitizedWord); // Mark this word as seen.
      antecedentCharacter = trailingChar; // Set up the character for the next word's comparison.
      continue; // Proceed to the next iteration.
    }

    // Check for two critical violations for subsequent words:
    const isWordPreviouslyUsed = previouslyEncounteredWords.has(sanitizedWord);
    const doesNotFollowChainRule = (leadingChar !== antecedentCharacter);

    if (isWordPreviouslyUsed || doesNotFollowChainRule) {
      chainValidationOutcome = false; // If either condition is true, the chain is broken.
      break;
    }

    // If no violations occurred, update the state for the next word.
    previouslyEncounteredWords.add(sanitizedWord); // Add the current word to the set of seen words.
    antecedentCharacter = trailingChar; // Update the character for the next comparison.
  }

  // Output the final result based on the integrity flag.
  if (chainValidationOutcome) {
    console.log("Yes");
  } else {
    console.log("No");
  }
});