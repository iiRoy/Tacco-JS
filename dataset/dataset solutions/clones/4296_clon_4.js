const fileSystem = require('fs');
const inputLine = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n')[0].split(' ');

const val1 = Number(inputLine[0]);
const val2 = Number(inputLine[1]);
const val3 = Number(inputLine[2]);

const numberCounts = new Map();
[val1, val2, val3].forEach(numValue => {
    numberCounts.set(numValue, (numberCounts.get(numValue) || 0) + 1);
});

let finalOutcome;
if (numberCounts.size === 3) {
    finalOutcome = val1;
} else if (numberCounts.size === 1) {
    finalOutcome = val3;
} else {
    for (const [numValue, occurrenceCount] of numberCounts.entries()) {
        if (occurrenceCount === 1) {
            finalOutcome = numValue;
            break;
        }
    }
}

console.log(finalOutcome);
