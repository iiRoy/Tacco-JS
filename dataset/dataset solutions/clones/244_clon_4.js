const fileSystemModule = require('node:fs');

const receivedContent = fileSystemModule.readFileSync(0).toString().trim();
const numericStrings = receivedContent.match(/\S+/g) || [];

const baseNumbers = Array.from({ length: 10 }, (_, k) => k + 1);

const inputTriplets = Array.from({ length: Math.floor(numericStrings.length / 3) }, (_, groupIdx) => {
    const startIndex = groupIdx * 3;
    return [
        Number(numericStrings[startIndex]),
        Number(numericStrings[startIndex + 1]),
        Number(numericStrings[startIndex + 2])
    ];
});

inputTriplets.forEach(currentTriplet => {
    const [firstOperand, secondOperand, forbiddenValue] = currentTriplet;

    const thresholdValue = 20 - (firstOperand + secondOperand);

    const eligibleNumberCount = baseNumbers.filter(candidateNumber => {
        return candidateNumber <= thresholdValue &&
               candidateNumber !== forbiddenValue &&
               candidateNumber !== secondOperand &&
               candidateNumber !== firstOperand;
    }).length;

    if (eligibleNumberCount >= 4) {
        process.stdout.write("Yes\n");
    } else {
        process.stdout.write("No\n");
    }
});