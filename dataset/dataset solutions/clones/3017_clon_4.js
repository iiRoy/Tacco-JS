const dataAcquirer = (sourceContent) => {
  const linesContent = sourceContent.trim().split("\n");
  const numericVal = Number(linesContent[0]);
  const charString = linesContent[1];
  return { numericVal, charString };
};

const sequenceTransformer = (transformFunc, initialVal, inputSequence) => {
  let currentAccum = initialVal;
  const outputSeries = [currentAccum];
  for (const element of inputSequence) {
    currentAccum = transformFunc(currentAccum, element);
    outputSeries.push(currentAccum);
  }
  return outputSeries;
};

const processInputAndSolve = () => {
  const { numericVal: sizeOfSequence, charString: targetString } = dataAcquirer(require("fs").readFileSync("/dev/stdin", "utf8"));

  const leftwardBlackCounts = sequenceTransformer(
    (acc, charItem) => acc + (charItem === '#' ? 1 : 0),
    0,
    targetString.split('')
  );

  const reversedTargetString = targetString.split('').reverse();
  const rightwardWhiteCountsReversed = sequenceTransformer(
    (acc, charItem) => acc + (charItem === '.' ? 1 : 0),
    0,
    reversedTargetString
  );
  const rightwardWhiteCounts = rightwardWhiteCountsReversed.reverse();

  const allCalculatedCosts = Array.from({ length: sizeOfSequence + 1 }, (_, positionIndex) => {
    return leftwardBlackCounts[positionIndex] + rightwardWhiteCounts[positionIndex];
  });

  const minimalOperations = Math.min(...allCalculatedCosts);

  return minimalOperations;
};

console.log(processInputAndSolve());