function executeProgram(initialInput) {
  const inputLines = initialInput.split('\n');
  const digitSource = Array.from(inputLines[1], Number);

  const potentialSequences = Array.from({ length: 1000 }, (_, sequenceIndex) => [
    Math.floor(sequenceIndex / 100),
    Math.floor((sequenceIndex % 100) / 10),
    sequenceIndex % 10
  ]);

  const checkSequencePresence = (sourceArray, targetArray, currentSourcePosition = 0, currentTargetPosition = 0) => {
    if (currentTargetPosition === targetArray.length) {
      return true;
    }
    if (currentSourcePosition === sourceArray.length) {
      return false;
    }

    if (sourceArray[currentSourcePosition] === targetArray[currentTargetPosition]) {
      return checkSequencePresence(sourceArray, targetArray, currentSourcePosition + 1, currentTargetPosition + 1);
    } else {
      return checkSequencePresence(sourceArray, targetArray, currentSourcePosition + 1, currentTargetPosition);
    }
  };

  const foundCount = potentialSequences.filter(currentSequence =>
    checkSequencePresence(digitSource, currentSequence)
  ).length;

  console.log(foundCount);
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
