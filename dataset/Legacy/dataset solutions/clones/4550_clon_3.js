function ProcessInputData(rawDataString) {
    const dataLines = rawDataString.split("\n");
    const configLine = dataLines[0];
    const configParts = configLine.split(" ");

    const totalEnemies = parseInt(configParts[0]);
    const highDamagePerHit = parseInt(configParts[1]);
    const lowDamagePerHit = parseInt(configParts[2]);

    let peakEnemyHealth = 0;
    let peakEnemyIndex = 0;
    const enemyHealthValues = [];

    // Removed 'killcount' as it was declared but never used.
    let finalAttackCount = 0;

    // Helper function to parse enemy health from input lines
    const parseEnemyHealth = (lineIndex) => {
        return parseInt(dataLines[lineIndex + 1]);
    };

    for (let enemyIdx = 0; enemyIdx < totalEnemies; enemyIdx++) {
        const currentEnemyHealth = parseEnemyHealth(enemyIdx);
        enemyHealthValues[enemyIdx] = currentEnemyHealth;

        if (currentEnemyHealth > peakEnemyHealth) {
            peakEnemyHealth = currentEnemyHealth;
            peakEnemyIndex = enemyIdx;
        }
    }

    // Original commented line remains commented
    // console.log(peakEnemyHealth + " " + peakEnemyIndex);

    // Introduce temporary constants for common calculations
    const LOW_DAMAGE_RECIPROCAL = 1 / lowDamagePerHit;
    const DOUBLE_LOW_DAMAGE_VALUE = 2 * lowDamagePerHit;
    const DAMAGE_DIFFERENCE_PER_HIT = highDamagePerHit - lowDamagePerHit;

    let searchUpperBound = Math.ceil(peakEnemyHealth * LOW_DAMAGE_RECIPROCAL);
    let searchLowerBound = 0;
    let previousAttackCount = 0;

    finalAttackCount = Math.ceil(peakEnemyHealth / DOUBLE_LOW_DAMAGE_VALUE);
    let currentBaseDamage = finalAttackCount * lowDamagePerHit;
    let loopIterationCount = 0;
    let additionalHitsRequired = 0;

    // Helper function to calculate extra hits needed for a single enemy
    const calculateRequiredExtraHits = (enemyHp, baseDmg, dmgDiff) => {
        if (enemyHp <= baseDmg) { // Guard clause
            return 0;
        }
        return Math.ceil((enemyHp - baseDmg) / dmgDiff);
    };

    // Constant for loop termination safeguard
    const MAX_ITERATIONS_ALLOWED = 100;

    // Refactor while(1) loop into a do...while with combined conditions
    do {
        loopIterationCount++;
        additionalHitsRequired = 0; // Reset at the beginning of each iteration

        currentBaseDamage = finalAttackCount * lowDamagePerHit;

        for (let enemyIdx = 0; enemyIdx < totalEnemies; enemyIdx++) {
            additionalHitsRequired += calculateRequiredExtraHits(
                enemyHealthValues[enemyIdx],
                currentBaseDamage,
                DAMAGE_DIFFERENCE_PER_HIT
            );
        }

        // Original commented line remains commented
        // console.log("max:" + searchUpperBound + " min:" + searchLowerBound + " ans:" + finalAttackCount + " extra:" + additionalHitsRequired + " temp:" + previousAttackCount);

        previousAttackCount = finalAttackCount; // Store current value before potential modification

        if (additionalHitsRequired > finalAttackCount) {
            searchLowerBound = finalAttackCount; // Split assignment
            finalAttackCount = Math.ceil((searchUpperBound + finalAttackCount) / 2);
        } else if (additionalHitsRequired < finalAttackCount) {
            searchUpperBound = finalAttackCount; // Split assignment
            finalAttackCount = Math.ceil((searchLowerBound + finalAttackCount) / 2);
        } else {
            // Exact match, break condition
            break;
        }

    } while (finalAttackCount !== previousAttackCount && loopIterationCount <= MAX_ITERATIONS_ALLOWED);

    console.log(finalAttackCount);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
