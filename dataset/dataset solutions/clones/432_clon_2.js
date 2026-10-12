const inputData = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const melodyLength = Number(inputData[0]);
const crystalTones = inputData
    .slice(1, melodyLength + 1)
    .map(Number);

let totalEnergy = 0;
let repetitionLevel = 0;
let lastTone = null;
let longestSequence = 0;

for (let position = 0; position < melodyLength; position++) {
    const currentTone = crystalTones[position];

    if (currentTone === lastTone) {
        repetitionLevel++;
    } else {
        repetitionLevel = 1;
    }

    totalEnergy += currentTone * repetitionLevel;

    if (repetitionLevel > longestSequence) {
        longestSequence = repetitionLevel;
    }

    lastTone = currentTone;
}

console.log(totalEnergy);
console.log(longestSequence);