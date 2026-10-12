"use strict";

function* evenCharacterExtractor(sourceString) {
  let currentIdx = 0;
  while (currentIdx < sourceString.length) {
    yield sourceString[currentIdx];
    currentIdx += 2;
  }
}

function processInputData(dataPayload) {
  const extractedChars = Array.from(evenCharacterExtractor(dataPayload));
  const finalOutput = extractedChars.join('');
  console.log(finalOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
