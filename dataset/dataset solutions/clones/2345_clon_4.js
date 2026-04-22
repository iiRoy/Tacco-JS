const computeDifference = (subjectText) => {
  const characters = Array.from(subjectText);
  const halfPoint = Math.floor(characters.length / 2);

  const totalDivergence = Array.from({ length: halfPoint }).reduce((accumulator, _, currentIdx) => {
    const frontChar = characters[currentIdx];
    const backChar = characters[characters.length - 1 - currentIdx];
    return accumulator + (frontChar !== backChar ? 1 : 0);
  }, 0);

  return totalDivergence;
};

const initiateOperation = (rawInputLines) => {
  const primaryString = rawInputLines[0];
  console.log(computeDifference(primaryString));
};

initiateOperation(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));