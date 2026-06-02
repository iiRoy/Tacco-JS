function main(input) {
  const xValue = parseInt(input.trim(), 10);

  const checkPowerStatus = (candidateNumber) => {
    if (candidateNumber < 2) {
      return false;
    }

    for (let currentExponent = 2; currentExponent <= 10; currentExponent++) {
      const potentialBase = Math.pow(candidateNumber, 1 / currentExponent);
      const nearestIntegerBase = Math.round(potentialBase);
      const floatComparisonTolerance = 1e-9; 

      if (
        nearestIntegerBase >= 2 &&
        Math.abs(potentialBase - nearestIntegerBase) < floatComparisonTolerance &&
        Math.pow(nearestIntegerBase, currentExponent) === candidateNumber
      ) {
        return true;
      }
    }
    return false;
  };

  for (let currentSearchValue = xValue; currentSearchValue >= 2; currentSearchValue--) {
    if (checkPowerStatus(currentSearchValue)) {
      console.log(currentSearchValue);
      return;
    }
  }

  console.log(1);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
