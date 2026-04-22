const processInputString = (entireInput) => {
  const allLines = entireInput.trim().split('\n');
  const numericLength = Number(allLines[0]);
  const targetSequence = allLines[1];

  if (numericLength === 0) {
    return -1;
  }

  const blockCount = targetSequence.split('').reduce((segmentTally, currentCharacter, charIndex, fullArray) => {
    const nextCharacter = fullArray[charIndex + 1];
    if (currentCharacter !== nextCharacter) {
      return segmentTally + 1;
    }
    return segmentTally;
  }, 0);

  return blockCount;
};

const executeProcessor = (sourceData) => {
  console.log(processInputString(sourceData));
};

executeProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));