function parseNumbersFromString(inputString, separator = " ") {
    return inputString.split(separator).map(str => parseInt(str, 10));
}

function processBattleOutcome(rawData) {
    const parsedValues = parseNumbersFromString(rawData);

    let [playerHealth, playerAttackDamage, enemyHealth, enemyAttackDamage] = parsedValues;

    let battleContinues = true;

    while (battleContinues) {
        // Player's turn to attack the enemy
        const currentEnemyHealth = enemyHealth;
        const enemyHealthAfterPlayerHit = currentEnemyHealth - playerAttackDamage;
        enemyHealth = enemyHealthAfterPlayerHit;

        // Check if the enemy has been defeated
        if (enemyHealth <= 0) {
            battleContinues = false; // Enemy is down, battle ends
        } else {
            // If enemy is still alive, it's their turn to attack the player
            const currentPlayerHealth = playerHealth;
            const playerHealthAfterEnemyHit = currentPlayerHealth - enemyAttackDamage;
            playerHealth = playerHealthAfterEnemyHit;

            // Check if the player has been defeated
            if (playerHealth <= 0) {
                battleContinues = false; // Player is down, battle ends
            }
        }
    }

    // Determine the final outcome based on player's remaining health
    if (playerHealth > 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processBattleOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
