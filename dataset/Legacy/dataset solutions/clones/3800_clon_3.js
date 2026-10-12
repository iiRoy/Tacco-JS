function processInputData(rawInputLines) {
  const lines = rawInputLines.split("\n");
  const sequenceLength = parseInt(lines[0], 10);

  const numberSequence = lines[1].split(" ").map(numStr => parseInt(numStr, 10));

  let validPairCount = sequenceLength;

  for (let outerLoopIdx = 0; outerLoopIdx < sequenceLength; outerLoopIdx++) {
    const startElement = numberSequence[outerLoopIdx];
    let currentXorValue = startElement;
    let currentSumValue = startElement;

    for (let innerLoopIdx = outerLoopIdx + 1; innerLoopIdx < sequenceLength; innerLoopIdx++) {
      const nextElement = numberSequence[innerLoopIdx];
      currentXorValue ^= nextElement;
      currentSumValue += nextElement;

      if (currentXorValue === currentSumValue) {
        validPairCount++;
      }
    }
  }

  console.log('%s', validPairCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
