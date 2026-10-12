const TARGET_WORD = 'keyence';
const TARGET_LENGTH = TARGET_WORD.length;

function processInputString(inputLines) {
  let currentLine = inputLines[0];
  let targetWordIndex = 0;
  let hasEncounteredMismatch = false;
  let isCurrentlySkipping = true; // True if not matching a keyence char, false if matching

  const currentLineLength = currentLine.length;

  for (let charIndex = 0; charIndex < currentLineLength; charIndex++) {
    const currentChar = currentLine.charAt(charIndex);

    if (currentChar === TARGET_WORD[targetWordIndex]) {
      targetWordIndex++;
      isCurrentlySkipping = false; // We are currently matching a part of keyence
    } else {
      // If we were just matching a part of keyence (!isCurrentlySkipping is true)
      // AND we've already encountered a mismatch before (hasEncounteredMismatch is true),
      // then this is the second non-matching segment, which is not allowed.
      if (!isCurrentlySkipping && hasEncounteredMismatch) {
        console.log('NO');
        return;
      }
      isCurrentlySkipping = true; // We are currently skipping non-keyence characters
      hasEncounteredMismatch = true; // Mark that we've seen at least one mismatch
    }
  }

  // After iterating through the entire line, check if all of 'keyence' was matched.
  if (targetWordIndex === TARGET_LENGTH) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  accumulatedInput += dataChunk;
});
process.stdin.on('end', function() {
  const processedInput = accumulatedInput.split('\n');
  processInputString(processedInput);
});
