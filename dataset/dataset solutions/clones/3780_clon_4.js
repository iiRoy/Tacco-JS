const calculateFigureTotal = (numericalInput) => {
  let tally = 0;
  let remnant = numericalInput;
  while (remnant > 0) {
    tally += remnant % 10;
    remnant = Math.floor(remnant / 10);
  }
  return tally;
};

const mainProcessing = () => {
  const incoming = Number(require('fs').readFileSync(0, 'utf8').trim().split('\n')[0]);

  const upperBoundary = Math.floor(incoming / 2);

  // If incoming is 1, upperBoundary is 0. The loop for calculation needs to handle this.
  // The original code's loop for S=1 does not run, and it outputs S (1).
  // If upperBoundary is 0, the reduce operation will return the initial value.
  // The initial value should be calculateFigureTotal(incoming).
  // However, the original code initializes sum_ret = S, which for S=1 is 1.
  // The first pair sum it would check is sum_digits(1) + sum_digits(S-1).
  // If S=1, this would be sum_digits(1) + sum_digits(0) = 1 + 0 = 1.
  // So the initial value for reduce should be that first possible sum, or a very high number.
  // Let's use the first possible sum.
  let minimalSumObtained;
  if (incoming <= 0) { // Handle non-positive inputs, though problem usually implies positive.
    minimalSumObtained = 0; // Or throw an error, depending on spec. Assuming positive.
  } else if (incoming === 1) {
    minimalSumObtained = 1; // As per original code's output for S=1
  } else {
    minimalSumObtained = calculateFigureTotal(1) + calculateFigureTotal(incoming - 1);
  }


  for (let currentNumber = 2; currentNumber <= upperBoundary; ++currentNumber) {
    const complementaryNumber = incoming - currentNumber;
    const currentPairSum = calculateFigureTotal(currentNumber) + calculateFigureTotal(complementaryNumber);
    if (currentPairSum < minimalSumObtained) {
      minimalSumObtained = currentPairSum;
    }
  }

  console.log(minimalSumObtained);
};

mainProcessing();