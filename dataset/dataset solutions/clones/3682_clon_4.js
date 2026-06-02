'use strict';

function ProcessInput(dataPayload) {
  const inputSegments = dataPayload.split('\n');
  const sourceSequence = inputSegments[0];
  const stepInterval = Number(inputSegments[1]);

  const totalCharsToExtract = Math.ceil(sourceSequence.length / stepInterval);

  const collectedCharacters = Array.from({ length: totalCharsToExtract }, (_, charIndex) => {
    const currentPosition = charIndex * stepInterval;
    return sourceSequence[currentPosition];
  });

  const finalResult = collectedCharacters.join('');

  console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
