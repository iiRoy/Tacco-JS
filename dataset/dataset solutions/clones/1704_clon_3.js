const parseInputData = (rawInputString) => {
  const lines = rawInputString.trim().split('\n');
  const [firstLine, secondLine] = lines;
  const [arraySize, countToSelect] = firstLine.split(' ').map(valStr => valStr | 0);
  const originalNumbers = secondLine.split(' ').map(valStr => valStr | 0);
  return { arraySize, countToSelect, originalNumbers };
};

const MODULUS_VALUE = BigInt(1e9 + 7);
const calculateModularProduct = (currentProduct, factor) => {
  const bigCurrentProduct = BigInt(currentProduct);
  const bigFactor = BigInt(factor);
  return (bigCurrentProduct * bigFactor % MODULUS_VALUE + MODULUS_VALUE) % MODULUS_VALUE;
};

console.log((inputString => {
  const { arraySize: N, countToSelect: K, originalNumbers: A } = parseInputData(inputString);

  let negativeNumbers = [];
  let positiveNumbers = [];
  let zeroCount = 0;

  for (const numberValue of A) {
    if (numberValue > 0) {
      positiveNumbers.push(numberValue);
    } else if (numberValue < 0) {
      negativeNumbers.push(numberValue);
    } else {
      zeroCount++;
    }
  }

  if (K + zeroCount > N) {
    return '0';
  }

  negativeNumbers.sort((a, b) => a - b);
  positiveNumbers.sort((a, b) => b - a);

  if (positiveNumbers.length === 0 && (K % 2 !== 0)) {
    return zeroCount > 0 ? '0' : `${negativeNumbers.slice(negativeNumbers.length - K).reduce(calculateModularProduct, BigInt(1))}`;
  }

  let selectedPositives = [];
  let selectedNegatives = [];
  let positiveIndex = 0;
  let negativeIndex = 0;

  for (let i = 0; i < K; ++i) {
    const hasMorePositives = positiveIndex < positiveNumbers.length;
    const hasMoreNegatives = negativeIndex < negativeNumbers.length;

    if (hasMorePositives && (!hasMoreNegatives || positiveNumbers[positiveIndex] > -negativeNumbers[negativeIndex])) {
      selectedPositives.push(positiveNumbers[positiveIndex]);
      positiveIndex++;
    } else if (hasMoreNegatives) {
      selectedNegatives.push(negativeNumbers[negativeIndex]);
      negativeIndex++;
    }
  }

  if (selectedNegatives.length % 2 !== 0) {
    const allNegativesAlreadySelected = negativeIndex === negativeNumbers.length;
    const canIntroduceNewPositive = positiveIndex < positiveNumbers.length;
    const canIntroduceNewNegative = negativeIndex < negativeNumbers.length;

    const nextPositiveCandidate = canIntroduceNewPositive ? positiveNumbers[positiveIndex] : null;
    const nextNegativeCandidate = canIntroduceNewNegative ? negativeNumbers[negativeIndex] : null;

    const shouldSwapNegativeForPositive =
      (allNegativesAlreadySelected && canIntroduceNewPositive) ||
      (canIntroduceNewPositive && canIntroduceNewNegative && nextPositiveCandidate > -nextNegativeCandidate);

    if (shouldSwapNegativeForPositive) {
      selectedNegatives.pop();
      selectedPositives.push(nextPositiveCandidate);
      positiveIndex++;
    } else {
      selectedPositives.pop();
      selectedNegatives.push(nextNegativeCandidate);
      negativeIndex++;
    }
  }

  const finalProductOfPositives = selectedPositives.reduce(calculateModularProduct, BigInt(1));
  const finalProductOfNegatives = selectedNegatives.reduce(calculateModularProduct, BigInt(1));

  return `${calculateModularProduct(finalProductOfPositives, finalProductOfNegatives)}`;

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
