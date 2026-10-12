"use strict";

const processInput = (rawInput) => {
  const inputLines = rawInput.trim().split("\n");
  const sourceText = inputLines[0];
  const textLength = sourceText.length;
  const targetRank = parseInt(inputLines[1]);

  const sortedUniqueStarters = [...new Set(sourceText.split(''))].sort();
  const collectedFragments = new Set();

  function* fragmentYieldingMachine(text, maxLength, starters) {
    const currentTextLength = text.length;
    for (const starterChar of starters) {
      for (let currentPos = 0; currentPos < currentTextLength; currentPos++) {
        if (text[currentPos] === starterChar) {
          for (let fragLen = 1; fragLen <= maxLength && currentPos + fragLen <= currentTextLength; fragLen++) {
            yield text.slice(currentPos, currentPos + fragLen);
          }
        }
      }
    }
  }

  const fragmentStream = fragmentYieldingMachine(sourceText, 5, sortedUniqueStarters);

  for (const currentFragment of fragmentStream) {
    collectedFragments.add(currentFragment);
    if (collectedFragments.size >= targetRank) {
      break;
    }
  }

  const finalFragment = [...collectedFragments].sort()[targetRank - 1];
  console.log(finalFragment);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
