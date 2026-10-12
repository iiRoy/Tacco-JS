function parseInitialParameters(lineContent) {
    const parameterParts = lineContent.split(" ");
    const parsedN = parseInt(parameterParts[0], 10);
    const parsedA = parseInt(parameterParts[1], 10);
    const parsedB = parseInt(parameterParts[2], 10);
    return {
        numMonsters: parsedN,
        strongAttackDamage: parsedA,
        weakAttackDamage: parsedB
    };
}

function retrieveMaxHealthInfo(healthArray) {
    if (healthArray.length === 0) {
        return { currentMaxHealthValue: -Infinity, maxHealthIndex: -1 };
    }
    let currentMaximum = -Infinity;
    let maximumIndex = -1;
    for (let k = 0; k < healthArray.length; k++) {
        const healthOfMonster = healthArray[k];
        if (healthOfMonster > currentMaximum) {
            currentMaximum = healthOfMonster;
            maximumIndex = k;
        }
    }
    return { currentMaxHealthValue: currentMaximum, maxHealthIndex: maximumIndex };
}

function solveChallenge(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const initialGameParams = parseInitialParameters(inputLines[0]);
    const numMonsters = initialGameParams.numMonsters;
    const strongAttack = initialGameParams.strongAttackDamage;
    const weakAttack = initialGameParams.weakAttackDamage;

    const monsterHealths = [];
    for (let monsterIdx = 0; monsterIdx < numMonsters; monsterIdx++) {
        monsterHealths.push(parseInt(inputLines[monsterIdx + 1], 10));
    }

    let totalAttacks = 0;
    while (true) {
        const { currentMaxHealthValue, maxHealthIndex: targetMonsterIndex } = retrieveMaxHealthInfo(monsterHealths);

        // Break condition: if no monsters left, or the strongest monster has negative health
        if (monsterHealths.length === 0 || currentMaxHealthValue < 0) {
            break;
        }

        for (let currentMonsterIndex = monsterHealths.length - 1; currentMonsterIndex >= 0; currentMonsterIndex--) {
            let monsterCurrentHealth = monsterHealths[currentMonsterIndex]; // Helper variable for current monster's health

            if (currentMonsterIndex === targetMonsterIndex) {
                monsterCurrentHealth -= strongAttack;
            } else {
                monsterCurrentHealth -= weakAttack;
            }

            // Update the health value in the array
            monsterHealths[currentMonsterIndex] = monsterCurrentHealth;

            // If monster's health drops to 0 or below, remove it from the array
            if (monsterCurrentHealth <= 0) {
                monsterHealths.splice(currentMonsterIndex, 1);
            }
        }
        totalAttacks++;
    }
    console.log('%s', totalAttacks);
}

solveChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
