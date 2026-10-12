const computeSummation = (dataCollection, totalCount, keyCount) => {
  const indexSequence = Array.from({ length: keyCount }, (_, idx) => totalCount - idx);

  return indexSequence.reduce((accumulatedValue, currentIdx) => {
    return accumulatedValue + dataCollection[currentIdx];
  }, 0);
};

const arrangeNumerically = (rawStrings) => {
  return rawStrings.map(Number).sort((valA, valB) => valA - valB);
};

const processInputData = (rawInput) => {
  const [firstLine, secondLine] = rawInput.split("\n");
  const [, countNStr, countKStr] = firstLine.split(" ");
  const valueStrings = secondLine.split(" ");

  const countN = Number(countNStr);
  const countK = Number(countKStr);

  console.log(computeSummation(arrangeNumerically(valueStrings), countN, countK));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
