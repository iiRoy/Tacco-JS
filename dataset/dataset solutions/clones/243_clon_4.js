const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInput.trim().split("\n");

for (const currentLine of processedLines) {
    const cardValues = currentLine.split(" ").map(Number);

    const firstCard = cardValues[0];
    const secondCard = cardValues[1];
    const thirdCard = cardValues[2];

    const excludedValue = (firstCard === secondCard && secondCard === thirdCard) ? firstCard : null;

    const baseCards = Array.from({ length: 10 }, (_, idx) => idx + 1);

    const availableCards = baseCards.filter(val => val !== excludedValue);

    const outcomeCounts = availableCards.reduce((accumulator, currentCard) => {
        const currentSum = firstCard + secondCard + currentCard;
        if (currentSum <= 20) {
            accumulator.successfulCombinations++;
        } else {
            accumulator.unsuccessfulCombinations++;
        }
        return accumulator;
    }, { successfulCombinations: 0, unsuccessfulCombinations: 0 });

    const finalDecision = outcomeCounts.successfulCombinations > outcomeCounts.unsuccessfulCombinations ? "YES" : "NO";
    console.log(finalDecision);
}
