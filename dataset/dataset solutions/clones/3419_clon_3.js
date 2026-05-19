"use strict";
function processInputAndCalculate(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const firstLineParts = inputLines[0].split(" ");
    const burgerStackLevel = parseInt(firstLineParts[0], 10);
    const bitesTaken = parseInt(firstLineParts[1], 10);
    console.log(determinePattiesEaten(burgerStackLevel, bitesTaken));
}
function calculateTotalComponents(level) {
    return (1 << (level + 2)) - 3;
}
function calculateTotalPatties(level) {
    return (1 << (level + 1)) - 1;
}
function determinePattiesEaten(currentBurgerLevel, bitesTaken) {
    if (currentBurgerLevel === 0) {
        return 1;
    }
    if (bitesTaken <= 1) {
        return 0;
    }
    const componentsInLowerLevel = calculateTotalComponents(currentBurgerLevel - 1);
    const pattiesInLowerLevel = calculateTotalPatties(currentBurgerLevel - 1);
    const midBunPosition = componentsInLowerLevel + 1;
    if (bitesTaken <= midBunPosition) {
        return determinePattiesEaten(currentBurgerLevel - 1, bitesTaken - 1);
    } else {
        const totalPattiesFromFirstHalf = pattiesInLowerLevel + 1;
        const remainingBites = bitesTaken - (midBunPosition + 1);
        return totalPattiesFromFirstHalf + determinePattiesEaten(currentBurgerLevel - 1, remainingBites);
    }
}
processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
