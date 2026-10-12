((inputString) => {
  const processedLines = inputString.trim().split('\n');

  const [totalEntities, primaryForce, secondaryForce] = processedLines[0].split(' ').map(Number);
  const entityResistances = processedLines.slice(1).map(Number);

  const determineFeasibility = (
    currentTrialValue,
    mainPower,
    subPower,
    resistanceLevels
  ) => {
    let availableCharges = currentTrialValue;
    const netDamagePerHit = mainPower - subPower;

    const finalChargeBalance = resistanceLevels.reduce(
      (accumulatorCharges, currentResistance) => {
        if (accumulatorCharges < 0) {
          return accumulatorCharges;
        }

        const resistanceAfterCharges = currentResistance - currentTrialValue * subPower;

        if (resistanceAfterCharges <= 0) {
          return accumulatorCharges;
        } else {
          const hitsRequired = Math.ceil(resistanceAfterCharges / netDamagePerHit);
          return accumulatorCharges - hitsRequired;
        }
      },
      availableCharges
    );

    return finalChargeBalance >= 0;
  };

  let lowestPossibleValue = 10 ** 9 + totalEntities;
  let highestImpossibleValue = 0;

  while (lowestPossibleValue > highestImpossibleValue + 1) {
    const testValue = (lowestPossibleValue + highestImpossibleValue) >>> 1;
    if (
      determineFeasibility(
        testValue,
        primaryForce,
        secondaryForce,
        entityResistances
      )
    ) {
      lowestPossibleValue = testValue;
    } else {
      highestImpossibleValue = testValue;
    }
  }

  return `${lowestPossibleValue}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
