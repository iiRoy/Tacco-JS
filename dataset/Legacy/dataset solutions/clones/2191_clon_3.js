"use strict"

function processGame(rawInputString) {
    const inputLines = rawInputString.trim().split("\n");

    const firstLineParts = inputLines[0].split(" ");
    let currentFighterHealth = parseInt(firstLineParts[0]);
    const maxAllowedAttackRounds = parseInt(firstLineParts[1]);

    const attackDamageValues = inputLines[1].split(" ").map(val => parseInt(val));
    const numberOfAttackTypes = attackDamageValues.length;

    let totalAttackRounds = 0;
    let damageIndex = 0;

    while (currentFighterHealth >= 0) {
        totalAttackRounds++;

        const effectiveDamageIndex = damageIndex % numberOfAttackTypes;
        const currentAttackDamage = attackDamageValues[effectiveDamageIndex];

        currentFighterHealth -= currentAttackDamage;

        damageIndex++;
    }

    if (totalAttackRounds <= maxAllowedAttackRounds) {
        console.log("yes");
    } else {
        console.log("no");
    }
}

processGame(require('fs').readFileSync('/dev/stdin', 'utf8'));
