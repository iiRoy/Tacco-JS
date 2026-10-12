function parseBattleData(rawText) {
    const dataLines = rawText.split('\n');
    const heroStrengthValues = dataLines[1].split(' ').map(Number);
    const foePowerLevels = dataLines[2].split(' ').map(Number);
    return { heroStrengthValues, foePowerLevels };
}

function computeTotalEliminated(heroStrengthValues, foePowerLevels) {
    const initialBattleState = {
        eliminatedCount: 0,
        currentHeroStrengths: [...heroStrengthValues]
    };

    const finalBattleState = foePowerLevels.reduce((accumulator, currentFoePower, foeIndex) => {
        let { eliminatedCount, currentHeroStrengths } = accumulator;

        const primaryHeroStrength = currentHeroStrengths[foeIndex];
        const auxiliaryHeroStrength = currentHeroStrengths[foeIndex + 1];

        if (primaryHeroStrength >= currentFoePower) {
            eliminatedCount += currentFoePower;
        } else {
            const remainingFoePower = currentFoePower - primaryHeroStrength;
            eliminatedCount += primaryHeroStrength;

            if (remainingFoePower <= auxiliaryHeroStrength) {
                eliminatedCount += remainingFoePower;
                currentHeroStrengths[foeIndex + 1] -= remainingFoePower;
            } else {
                eliminatedCount += auxiliaryHeroStrength;
                currentHeroStrengths[foeIndex + 1] = 0;
            }
        }

        return { eliminatedCount, currentHeroStrengths };
    }, initialBattleState);

    return finalBattleState.eliminatedCount;
}

function processBattleScenario(inputData) {
    const { heroStrengthValues, foePowerLevels } = parseBattleData(inputData);
    const finalEliminated = computeTotalEliminated(heroStrengthValues, foePowerLevels);
    console.log(finalEliminated);
}

processBattleScenario(require("fs").readFileSync("/dev/stdin", "utf8").trim());
