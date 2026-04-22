const solveForOptimalValue = (puzzleInput) => {
    const dataLines = puzzleInput.trim().split('\n');
    const [headerLine, ...enemyHealthLines] = dataLines;
    const [foeCount, specialDamage, regularDamage] = headerLine.split(' ').map(Number);
    
    const adversaryHealths = enemyHealthLines.map(Number);
    const maximumHealth = Math.max(...adversaryHealths);

    const assessRoundSufficiency = (candidateRounds) => {
        const totalRegularDamageDealt = candidateRounds * regularDamage;
        const incrementalSpecialDamage = specialDamage - regularDamage;

        if (incrementalSpecialDamage <= 0) {
            return adversaryHealths.every(hp => hp <= totalRegularDamageDealt);
        }

        let totalSupplementalAttacksNeeded = 0;
        for (const individualFoeHP of adversaryHealths) {
            if (individualFoeHP > totalRegularDamageDealt) {
                totalSupplementalAttacksNeeded += Math.ceil((individualFoeHP - totalRegularDamageDealt) / incrementalSpecialDamage);
            }
        }
        return totalSupplementalAttacksNeeded <= candidateRounds;
    };

    const findMinimumSatisfyingValue = (lowerBoundary, upperBoundary, evaluationPredicate, maxIterLimit = 150) => {
        let potentialAnswer = upperBoundary;
        let currentLow = lowerBoundary;
        let currentHigh = upperBoundary;
        let iterationCounter = 0;

        while (currentLow <= currentHigh && iterationCounter < maxIterLimit) {
            const midCandidate = Math.ceil((currentLow + currentHigh) / 2);

            if (evaluationPredicate(midCandidate)) {
                potentialAnswer = midCandidate;
                currentHigh = midCandidate - 1;
            } else {
                currentLow = midCandidate + 1;
            }
            iterationCounter++;
        }
        return potentialAnswer;
    };

    const searchRangeLowerBound = 0;
    const searchRangeUpperBound = Math.ceil(maximumHealth / regularDamage); 

    return findMinimumSatisfyingValue(searchRangeLowerBound, searchRangeUpperBound, assessRoundSufficiency);
};

console.log(solveForOptimalValue(require("fs").readFileSync("/dev/stdin", "utf8")));