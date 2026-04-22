function fetchNumber() {
  return parseInt(obj.next());
}

function outputJoinedLines(dataCollection) {
  console.log(dataCollection.join('\n'));
}

function calculateAndDisplaySolution() {
  const inputQuantity = fetchNumber();
  const frequencyMap = new Map();

  const computeSummation = (firstTerm, secondTerm, thirdTerm) => {
    return (
      firstTerm * firstTerm +
      secondTerm * secondTerm +
      thirdTerm * thirdTerm +
      firstTerm * secondTerm +
      secondTerm * thirdTerm +
      thirdTerm * firstTerm
    );
  };

  const buildRange = (startVal, endVal) =>
    Array.from({ length: endVal - startVal + 1 }, (_, idx) => startVal + idx);

  const sequenceA = buildRange(1, 200);
  const sequenceB = buildRange(1, 200);
  const sequenceC = buildRange(1, 200);

  sequenceA.forEach(itemA => {
    sequenceB.forEach(itemB => {
      sequenceC.forEach(itemC => {
        const currentSum = computeSummation(itemA, itemB, itemC);
        frequencyMap.set(currentSum, (frequencyMap.get(currentSum) || 0) + 1);
      });
    });
  });

  const finalOutputArray = Array.from({ length: inputQuantity }, (_, indexPosition) => {
    const queryKey = indexPosition + 1;
    return frequencyMap.get(queryKey) || 0;
  });

  outputJoinedLines(finalOutputArray);
}