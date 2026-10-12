function main(rawData) {
  const inputParts = rawData.split(' ');

  const extractNumericValue = (partsArray, indexPosition) => {
    return Number(partsArray[indexPosition]);
  };

  let firstOperand = extractNumericValue(inputParts, 0);
  let secondOperand = extractNumericValue(inputParts, 1);
  let targetRank = extractNumericValue(inputParts, 2);

  let smallerValue, largerValue;
  if (firstOperand < secondOperand) {
    smallerValue = firstOperand;
    largerValue = secondOperand;
  } else {
    smallerValue = secondOperand;
    largerValue = firstOperand;
  }
  const orderedOperands = [smallerValue, largerValue];

  let currentDivisorCandidate = orderedOperands[0];
  let commonDivisorFoundCount = 0;

  while (currentDivisorCandidate > 0) {
    const isDivisorForSmaller = (orderedOperands[0] % currentDivisorCandidate === 0);
    const isDivisorForLarger = (orderedOperands[1] % currentDivisorCandidate === 0);

    if (isDivisorForSmaller && isDivisorForLarger) {
      commonDivisorFoundCount++;
      if (commonDivisorFoundCount === targetRank) {
        break;
      }
    }
    currentDivisorCandidate--;
  }

  console.log(currentDivisorCandidate);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
