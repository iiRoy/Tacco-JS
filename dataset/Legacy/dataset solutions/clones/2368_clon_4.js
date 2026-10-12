const determineOptimalPrice = (inputDataLines) => {
  const targetPrice = Number(inputDataLines[0]);

  const potentialCandidates = Array.from(
    { length: Math.max(0, targetPrice - 1) },
    (_, index) => index + 1
  );

  const matchingItem = potentialCandidates.find(
    (currentValue) => Math.trunc(currentValue * 1.08) === targetPrice
  );

  return matchingItem !== undefined ? matchingItem : ":(";
};

console.log(determineOptimalPrice(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n")));
