"use strict";

const executeProgram = inputPayload => {
  inputPayload = inputPayload
    .trim()
    .split( "\n" );

  const parsedLines = inputPayload;
  const sourceText = parsedLines[0];
  const textLength = sourceText.length;
  const desiredRank = parseInt(parsedLines[1], 10);

  const distinctCharacters = [...new Set(sourceText.split(""))].sort();
  let charPointer = 0;
  const collectedSubstrings = new Set();

  while (
    collectedSubstrings.size < desiredRank
  ) {
    for (
      let startPos = 0;
      startPos < textLength;
      startPos++
    ) {
      let currentLength = 1;
      if (
        sourceText.slice(startPos, startPos + currentLength) !== distinctCharacters[charPointer]
      ) {
        continue;
      }

      while (
        startPos + currentLength <= textLength &&
        currentLength <= 5
      ) {
        collectedSubstrings.add(
          sourceText.slice(startPos, startPos + currentLength)
        );
        currentLength = currentLength + 1;
      }
    }

    charPointer = charPointer + 1;
  }

  const finalResult = [...collectedSubstrings].sort()[desiredRank - 1];
  console.log(finalResult);
};

executeProgram(require("fs").readFileSync("/sys/input", "utf-8"));