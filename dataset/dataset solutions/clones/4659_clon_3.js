function ProcessNumberData(rawInputString) {
  const targetNumber = parseInt(rawInputString, 10);

  let minFactorStringLength = String(targetNumber).length;

  const loopUpperLimit = Math.sqrt(targetNumber);

  for (let divisorCandidate = 1; divisorCandidate < loopUpperLimit; divisorCandidate++) {
    if (targetNumber % divisorCandidate === 0) {
      const currentDivisorString = String(divisorCandidate);
      const currentDivisorLength = currentDivisorString.length;

      const complementaryDivisor = targetNumber / divisorCandidate;
      const complementaryDivisorString = String(complementaryDivisor);
      const complementaryDivisorLength = complementaryDivisorString.length;

      const currentMaxFactorPairLength = Math.max(currentDivisorLength, complementaryDivisorLength);

      if (currentMaxFactorPairLength < minFactorStringLength) {
        minFactorStringLength = currentMaxFactorPairLength;
      }
    }
  }

  console.log('%s', minFactorStringLength);
}

ProcessNumberData(require("fs").readFileSync("/dev/stdin", "utf8"));
