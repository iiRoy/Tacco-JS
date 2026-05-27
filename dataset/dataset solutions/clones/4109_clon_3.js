"use strict";

const calculateCeilingDivision = (numeratorValue, denominatorValue) => {
    return Math.ceil(numeratorValue / denominatorValue);
};

const processInput = (inputData) => {
    const inputLines = inputData.trim().split("\n");

    const firstLineElements = inputLines[0].split(" ");
    const katanaCount = parseInt(firstLineElements[0], 10);
    let monsterHealth = parseInt(firstLineElements[1], 10);

    const katanaConfigurations = inputLines.slice(1, katanaCount + 1).map(lineContent => {
        const [swingDamageString, throwDamageString] = lineContent.split(" ");
        return [parseInt(swingDamageString, 10), parseInt(throwDamageString, 10)];
    });

    let highestSwingDamage = 0;
    let highestSwingKatanaIndex = 0;
    let cumulativeThrowDamage = 0;

    katanaConfigurations.forEach((currentKatanaConfig, currentIndex) => {
        const currentKatanaSwingDamage = currentKatanaConfig[0];
        const currentKatanaThrowDamage = currentKatanaConfig[1];

        cumulativeThrowDamage += currentKatanaThrowDamage;

        if (currentKatanaSwingDamage > highestSwingDamage) {
            highestSwingDamage = currentKatanaSwingDamage;
            highestSwingKatanaIndex = currentIndex;
        }
    });

    const bestSwingKatanaConfiguration = katanaConfigurations[highestSwingKatanaIndex];
    const bestSwingKatanaThrowDamage = bestSwingKatanaConfiguration[1];

    if (cumulativeThrowDamage >= monsterHealth) {
        console.log(katanaCount);
        return;
    }

    const damageFromOtherKatanaThrows = cumulativeThrowDamage - bestSwingKatanaThrowDamage;
    monsterHealth -= damageFromOtherKatanaThrows;

    const healthRemainingAfterBestKatanaThrow = monsterHealth - bestSwingKatanaThrowDamage;

    const swingsNeededForRemainingHealth = calculateCeilingDivision(
        healthRemainingAfterBestKatanaThrow,
        bestSwingKatanaConfiguration[0]
    );

    let finalOperationCount;
    if (katanaCount === 1) {
        finalOperationCount = swingsNeededForRemainingHealth + 1;
    } else {
        finalOperationCount = swingsNeededForRemainingHealth + (katanaCount - 1);
    }

    console.log(finalOperationCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
