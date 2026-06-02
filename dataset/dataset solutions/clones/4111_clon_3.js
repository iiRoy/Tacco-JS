"use strict";

const processInput = (rawData) => {
    const inputLines = rawData.trim().split("\n");

    const firstLineData = inputLines[0].split(" ");
    const numKatanas = parseInt(firstLineData[0]);
    const targetHP = parseInt(firstLineData[1]);

    const katanaDetails = inputLines.slice(1, numKatanas + 1).map(line => {
        const parts = line.split(" ");
        return {
            attack: parseInt(parts[0]),
            throw: parseInt(parts[1])
        };
    });

    let highestAttackPower = 0;
    let cumulativeThrowDamage = 0;

    katanaDetails.forEach(katana => {
        cumulativeThrowDamage += katana.throw;

        if (katana.attack > highestAttackPower) {
            highestAttackPower = katana.attack;
        }
    });

    // If the total damage from throwing all katanas is sufficient,
    // then throwing all katanas is the most efficient strategy.
    if (cumulativeThrowDamage >= targetHP) {
        console.log(numKatanas);
        return;
    }

    // Calculate the remaining HP that must be dealt by swinging the strongest katana.
    // This is the initial target HP minus the total damage from throwing all katanas.
    const hpRemainingForSwings = targetHP - cumulativeThrowDamage;

    // Determine the number of swings required for the strongest katana.
    // Since cumulativeThrowDamage was not enough, hpRemainingForSwings will be positive.
    const swingsRequired = Math.ceil(hpRemainingForSwings / highestAttackPower);

    // Calculate the total number of actions (swings + throws).
    let totalActionsCount;
    if (numKatanas === 1) {
        // If there's only one katana, it's thrown once, then swung 'swingsRequired' times.
        totalActionsCount = swingsRequired + 1;
    } else {
        // If there are multiple katanas, all (numKatanas - 1) weaker katanas are thrown.
        // The strongest katana is then swung 'swingsRequired' times.
        // The throw damage of the strongest katana was already included in cumulativeThrowDamage.
        // The problem's specific logic counts (N-1) throws for N>1.
        totalActionsCount = swingsRequired + (numKatanas - 1);
    }

    console.log(totalActionsCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
