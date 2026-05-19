const isDebuggingEnabled = false;
const maxIntVal = Number.MAX_SAFE_INTEGER;

function parseNumberArray(lineContent) {
    return lineContent.split(" ").map(Number);
}

function processCombatScenario(rawInputLines) {
    const inputLines = rawInputLines.split("\n");

    let totalDamageDealt = 0;
    const monsterHPs = parseNumberArray(inputLines[1]);
    const heroAttackPowers = parseNumberArray(inputLines[2]);

    const numberOfHeroes = heroAttackPowers.length;

    for (let currentHeroIndex = 0; currentHeroIndex < numberOfHeroes; currentHeroIndex++) {
        let currentMonsterHealth = monsterHPs[currentHeroIndex];
        let currentHeroAttack = heroAttackPowers[currentHeroIndex];
        let nextMonsterHealth = monsterHPs[currentHeroIndex + 1]; // Can be undefined for the last element

        let damageAppliedInThisTurn = 0;

        if (currentMonsterHealth >= currentHeroAttack) {
            // Hero's attack is sufficient for the current monster
            damageAppliedInThisTurn = currentHeroAttack;
            totalDamageDealt += damageAppliedInThisTurn;
        } else {
            // Hero's attack is less than current monster's health
            // The current monster takes full damage from this hero
            damageAppliedInThisTurn = currentMonsterHealth;
            let remainingHeroAttackPower = currentHeroAttack - currentMonsterHealth;

            // Check if the next monster can absorb the remaining attack power
            // This condition correctly evaluates to false if nextMonsterHealth is undefined
            if (remainingHeroAttackPower <= nextMonsterHealth) {
                // Next monster absorbs the remaining attack power
                damageAppliedInThisTurn += remainingHeroAttackPower;
                totalDamageDealt += damageAppliedInThisTurn;
                // Update the next monster's health
                monsterHPs[currentHeroIndex + 1] -= remainingHeroAttackPower;
            } else {
                // Next monster cannot absorb all remaining power, or there is no next monster
                // Total damage is current monster's health + whatever health the next monster had (or undefined)
                damageAppliedInThisTurn += nextMonsterHealth; // This will result in NaN if nextMonsterHealth is undefined
                totalDamageDealt += damageAppliedInThisTurn; // totalDamageDealt will become NaN if damageAppliedInThisTurn is NaN
                // The next monster (or a new element if out of bounds) is set to 0 health
                monsterHPs[currentHeroIndex + 1] = 0;
            }
        }
    }
    console.log(totalDamageDealt);
}

processCombatScenario(require("fs").readFileSync("/dev/stdin", "utf8").trim());
