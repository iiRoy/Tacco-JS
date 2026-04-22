const inputRawArguments = process.argv.slice(2).join(' ');
const contentLineDelimiter = '__NEWLINE__'; // Custom delimiter to separate input lines
const processedInputContent = inputRawArguments.trim().split(contentLineDelimiter);

let inputPointer = 0;

function fetchNextInputSegment() {
  if (inputPointer >= processedInputContent.length) {
    throw new Error("Input stream exhausted.");
  }
  return processedInputContent[inputPointer++];
}

function hasMoreInputSegments() {
  return inputPointer < processedInputContent.length;
}

function outputResult(dataToDisplay) {
  console.log(dataToDisplay);
}

function outputDiagnostic(diagnosticData) {
  console.error(diagnosticData);
}

// Utility function to convert a string into an array of its characters
function stringToCharCollection(sourceString) {
  return Array.from(sourceString);
}

// The primary execution function, equivalent to Main()
function startProcessingRoutine() {
  const currentSequence = fetchNextInputSegment();

  // Array representing the full lowercase English alphabet
  const completeAlphabet = Array.from({
    length: 26
  }, (_, charCodeOffset) => String.fromCharCode(97 + charCodeOffset));

  if (currentSequence.length < 26) {
    // Determine which characters from the alphabet are present in the current sequence
    const existingCharacters = new Set(stringToCharCollection(currentSequence));

    // Create a mutable copy of the alphabet to reflect character usage for diagnostic output
    let alphabetForDiagnostic = Array.from(completeAlphabet);
    for (let charIndex = 0; charIndex < currentSequence.length; charIndex++) {
      const charToMark = currentSequence[charIndex];
      const positionInAlphabet = alphabetForDiagnostic.indexOf(charToMark);
      if (positionInAlphabet !== -1) {
        alphabetForDiagnostic[positionInAlphabet] = ""; // Mark as used
      }
    }
    outputDiagnostic(alphabetForDiagnostic); // Output this modified alphabet to stderr

    let characterToAppend = '';
    // Find the lexicographically smallest character not present in the sequence
    for (let charIndex = 0; charIndex < 26; charIndex++) {
      const alphaChar = String.fromCharCode(97 + charIndex);
      if (!existingCharacters.has(alphaChar)) {
        characterToAppend = alphaChar;
        break;
      }
    }
    outputResult(currentSequence + characterToAppend);
  } else { // currentSequence.length === 26
    // Generate the reverse alphabetical string "zyxwvutsrqponmlkjihgfedcba"
    const reverseAlphaComparisonString = Array.from({
      length: 26
    }, (_, charCodeOffset) => String.fromCharCode(122 - charCodeOffset)).join('');

    if (currentSequence === reverseAlphaComparisonString) {
      outputResult(-1);
    } else {
      // This branch intentionally performs no action, mirroring the original's empty 'else' block.
    }
  }
}

// Initiate the program flow
startProcessingRoutine();