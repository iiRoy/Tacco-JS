const ingestData = (rawDataSegment) => {
    const dataLines = rawDataSegment.split('\n').filter(Boolean);
    const [initialParameters, ...entityHealthData] = dataLines;
    const [mobCount, alphaDamage, betaDamage] = initialParameters.split(' ').map(Number);
    const mobHPs = entityHealthData.map(Number);
    return { mobCount, alphaDamage, betaDamage, mobHPs };
};

const evaluateFeasibility = (trialValue, alphaDamage, betaDamage, mobHPs) => {
    const damageDifference = alphaDamage - betaDamage;
    const supplementalStrikesNeeded = mobHPs.reduce((totalRequired, currentHP) => {
        const remainingHP = currentHP - trialValue * betaDamage;
        if (remainingHP <= 0) {
            return totalRequired;
        }
        return totalRequired + Math.ceil(remainingHP / damageDifference);
    }, 0);
    return trialValue >= supplementalStrikesNeeded;
};

const determineOptimalValue = (floorVal, ceilingVal, alphaDamage, betaDamage, mobHPs) => {
    if (floorVal + 1 >= ceilingVal) {
        return ceilingVal;
    }
    const pivot = Math.floor((floorVal + ceilingVal) / 2);
    if (evaluateFeasibility(pivot, alphaDamage, betaDamage, mobHPs)) {
        return determineOptimalValue(floorVal, pivot, alphaDamage, betaDamage, mobHPs);
    } else {
        return determineOptimalValue(pivot, ceilingVal, alphaDamage, betaDamage, mobHPs);
    }
};

const orchestrateSolution = (inputPayload) => {
    const { mobCount, alphaDamage, betaDamage, mobHPs } = ingestData(inputPayload);

    const initialFloor = 0;
    const initialCeiling = 2 * 10**9 + 7; // A sufficiently large upper bound for attacks

    const finalOutcome = determineOptimalValue(
        initialFloor,
        initialCeiling,
        alphaDamage,
        betaDamage,
        mobHPs
    );

    return String(finalOutcome);
};

console.log((orchestrateSolution(require('fs').readFileSync('/dev/stdin','utf8'))));