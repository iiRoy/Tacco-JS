function processInputData(rawData) {
  const linesOfData = rawData.split('\n');
  const charCollection = linesOfData[0].split('');
  const numericalFactor = Number(linesOfData[1]);

  let pairCount = 0;

  if (charCollection.length === 0) {
    pairCount = numericalFactor - 1;
  } else {
    const countConsecutivePairs = (sequence, currentIdx) => {
      if (currentIdx >= sequence.length - 1) {
        return 0;
      }
      const match = (sequence[currentIdx] === sequence[currentIdx + 1]) ? 1 : 0;
      return match + countConsecutivePairs(sequence, currentIdx + 1);
    };
    pairCount = countConsecutivePairs(charCollection, 0);
    pairCount *= numericalFactor;
  }
  console.log(pairCount);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));