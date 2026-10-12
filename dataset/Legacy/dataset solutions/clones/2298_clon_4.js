'use strict';

const processInput = (dataLines) => {
  const initialValue = parseInt(dataLines[0]);

  const isPrimeCandidate = (numeral) => {
    if (numeral <= 3) {
      return true;
    }

    const potentialDivisors = Array.from(
      { length: numeral - 3 },
      (_, index) => 2 + index
    );

    const hasDivisor = potentialDivisors.some(
      (divisor) => numeral % divisor === 0
    );

    return !hasDivisor;
  };

  const numberSequence = Array.from(
    { length: initialValue },
    (_, index) => initialValue + index
  );

  const firstMatchingNumber = numberSequence.find(isPrimeCandidate);

  if (firstMatchingNumber !== undefined) {
    console.log(firstMatchingNumber);
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
