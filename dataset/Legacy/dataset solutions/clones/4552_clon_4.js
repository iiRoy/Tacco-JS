function processCombatScenario(rawScenarioData) {
    const parsedLines = rawScenarioData.split("\n").map(line => line.split(" ").map(Number));

    const [enemyCount, highDamagePerAttack, lowDamagePerAttack] = parsedLines[0];
    const enemyHealths = parsedLines.slice(1, enemyCount + 1).map(arr => arr[0]);

    const peakEnemyHealth = enemyHealths.reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), 0);

    const calculateAdditionalAttacks = (currentRounds, healths, highDmg, lowDmg) => {
        const baseDamageOutput = currentRounds * lowDmg;
        return healths.reduce((totalExtra, currentEnemyHP) => {
            if (currentEnemyHP > baseDamageOutput) {
                return totalExtra + Math.ceil((currentEnemyHP - baseDamageOutput) / (highDmg - lowDmg));
            }
            return totalExtra;
        }, 0);
    };

    const findOptimalRounds = (currentLowerBound, currentUpperBound, currentCandidateRounds) => {
        const additionalAttacksRequired = calculateAdditionalAttacks(
            currentCandidateRounds,
            enemyHealths,
            highDamagePerAttack,
            lowDamagePerAttack
        );

        if (additionalAttacksRequired === currentCandidateRounds) {
            return currentCandidateRounds;
        }

        let nextLowerBound = currentLowerBound;
        let nextUpperBound = currentUpperBound;
        let nextCandidateRounds;

        if (additionalAttacksRequired > currentCandidateRounds) {
            nextLowerBound = currentCandidateRounds;
            nextCandidateRounds = Math.ceil((currentUpperBound + currentCandidateRounds) / 2);
        } else {
            nextUpperBound = currentCandidateRounds;
            nextCandidateRounds = Math.ceil((currentLowerBound + currentCandidateRounds) / 2);
        }
        
        return findOptimalRounds(nextLowerBound, nextUpperBound, nextCandidateRounds);
    };

    const initialLowerBound = 0;
    const initialUpperBound = Math.ceil(peakEnemyHealth / lowDamagePerAttack);
    const initialCandidateRounds = Math.ceil(peakEnemyHealth / (2 * lowDamagePerAttack));

    const finalOptimalRounds = findOptimalRounds(initialLowerBound, initialUpperBound, initialCandidateRounds);

    console.log(finalOptimalRounds);
}

processCombatScenario(require("fs").readFileSync("/dev/stdin", "utf8"));
