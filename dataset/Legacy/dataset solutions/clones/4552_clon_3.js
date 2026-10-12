function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const firstLineData = inputLines[0].split(" ");

    const enemyCount = parseInt(firstLineData[0]);
    const highDamage = parseInt(firstLineData[1]);
    const lowDamage = parseInt(firstLineData[2]);

    const enemyHealths = [];
    let peakHealth = 0;

    for (let i = 0; i < enemyCount; i++) {
        const currentEnemyHp = parseInt(inputLines[i + 1]);
        enemyHealths.push(currentEnemyHp);
        if (currentEnemyHp > peakHealth) {
            peakHealth = currentEnemyHp;
        }
    }

    const calculateRequiredExtraAttacks = (currentEnemyHp, baseAttackDamageValue, highDamageValue, lowDamageValue) => {
        if (currentEnemyHp <= baseAttackDamageValue) {
            return 0;
        }
        const remainingHealth = currentEnemyHp - baseAttackDamageValue;
        const damagePerSpecialAttack = highDamageValue - lowDamageValue;
        return Math.ceil(remainingHealth / damagePerSpecialAttack);
    };

    let upperBound = Math.ceil(peakHealth / lowDamage);
    let lowerBound = 0;
    let tempValue = 0;
    let attackRounds = Math.ceil(peakHealth / (2 * lowDamage));
    
    const baseDamagePerLowAttack = lowDamage;
    let iterationAdditionalAttacks = 0;

    while (true) {
        iterationAdditionalAttacks = 0;
        const currentBaseAttackDamage = attackRounds * baseDamagePerLowAttack;

        for (let i = 0; i < enemyCount; i++) {
            iterationAdditionalAttacks += calculateRequiredExtraAttacks(enemyHealths[i], currentBaseAttackDamage, highDamage, lowDamage);
        }

        if (iterationAdditionalAttacks > attackRounds) {
            tempValue = attackRounds;
            attackRounds = Math.ceil((upperBound + attackRounds) / 2);
            lowerBound = tempValue;
        } else if (iterationAdditionalAttacks < attackRounds) {
            tempValue = attackRounds;
            attackRounds = Math.ceil((lowerBound + attackRounds) / 2);
            upperBound = tempValue;
        } else {
            break;
        }
    }

    console.log(attackRounds);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
