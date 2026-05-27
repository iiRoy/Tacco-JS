function processStringDifferences(inputSequence) {
  const sequenceLength = inputSequence.length;
  let changeOccurrences = 0;

  if (sequenceLength === 0) {
    console.log(0);
    return;
  }

  let lastSeenChar = inputSequence[0];
  const iterationStartOffset = 1;

  for (let currentIndex = iterationStartOffset; currentIndex < sequenceLength; currentIndex++) {
    const currentCharacter = inputSequence[currentIndex];
    if (currentCharacter !== lastSeenChar) {
      changeOccurrences++;
      lastSeenChar = currentCharacter;
    }
  }
  console.log(changeOccurrences);
}

processStringDifferences(require("fs").readFileSync("/dev/stdin", "utf8").trim());
