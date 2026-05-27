"use strict";

function InputSourceProcessor(sourceText, defaultParser = Number) {
  const allRawLines = sourceText.split('\n');
  let currentLineIndex = 0;
  let currentWordIndex = 0; // This tracks word within the *current line being processed by getNextToken*
  let currentLineWordsCache = []; // Words for the current line for getNextToken

  // Helper to advance to the next line and reset word tracking
  const advanceToNextLine = () => {
    currentLineIndex++;
    currentWordIndex = 0;
    currentLineWordsCache = [];
  };

  const getNextToken = (customParser) => {
    // If we've exhausted the current line's words, or haven't processed any line yet
    if (currentWordIndex >= currentLineWordsCache.length) {
      // Find the next line that can provide tokens for 'a' method
      let foundValidLine = false;
      while (currentLineIndex < allRawLines.length) {
        const rawLine = allRawLines[currentLineIndex];
        if (rawLine !== undefined) { // Check if line exists
          const trimmedLine = rawLine.trim();
          // Original 'a' uses `i.trim().split(" ")`. If trimmedLine is "", split gives `[""]`.
          currentLineWordsCache = trimmedLine.split(' ');
          if (currentLineWordsCache.length > 0) { // A line like " " becomes `[""]`, length 1.
            foundValidLine = true;
            currentWordIndex = 0; // Reset word index for this new line
            break;
          }
        }
        // If line is undefined, or trimmedLine is empty and split gives `[]` (shouldn't happen with `split(' ')` on `""`),
        // or if `currentLineWordsCache` is empty (e.g., `split(' ')` on `''` gives `['']`),
        // we still need to advance to the next line.
        advanceToNextLine();
      }

      if (!foundValidLine) {
        return undefined; // End of input
      }
    }

    // Now currentLineWordsCache should contain words for the current line
    const token = currentLineWordsCache[currentWordIndex];
    currentWordIndex++;

    // If we've exhausted words for this line, prepare for the next line
    if (currentWordIndex >= currentLineWordsCache.length) {
      advanceToNextLine();
    }
    return (customParser || defaultParser)(token);
  };

  const getLineTokens = (customParser) => {
    if (currentLineIndex >= allRawLines.length) {
      return undefined; // End of input
    }

    const rawLine = allRawLines[currentLineIndex];
    advanceToNextLine(); // Advance line pointer immediately after reading the line

    // Original 'l' uses `i.split(" ")` directly, not `i.trim().split(" ")`.
    const tokens = rawLine.split(' ').map(customParser || defaultParser);
    return tokens;
  };

  return {
    getNextToken: getNextToken,
    getLineTokens: getLineTokens
  };
}

module.exports = InputSourceProcessor;

function processInput(rawInput) {
  const inputReader = InputSourceProcessor(rawInput);

  const firstValue = inputReader.getNextToken();
  const secondValue = inputReader.getNextToken();

  if (secondValue === 0) {
    const sequenceLimit = 1 << firstValue; // Equivalent to Math.pow(2, firstValue)

    const ascendingPart = Array.from({ length: sequenceLimit }, (_, idx) => idx);
    const descendingPart = Array.from({ length: sequenceLimit }, (_, idx) => sequenceLimit - 1 - idx);

    console.log([...ascendingPart, ...descendingPart].join(" "));
  } else {
    console.log("-1");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
