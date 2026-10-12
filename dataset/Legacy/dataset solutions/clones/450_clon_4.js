const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = fileContent.trim().split('\n');

function* numberGroupGenerator(sourceLines) {
    let currentPosition = 0;
    while (currentPosition + 4 < sourceLines.length) {
        const currentBatch = sourceLines.slice(currentPosition, currentPosition + 5).map(Number);
        if (currentBatch[0] === 0) {
            break;
        }
        yield currentBatch;
        currentPosition += 5;
    }
}

const dataIterator = numberGroupGenerator(rawLines);

for (const currentSet of dataIterator) {
    const [valA, valB, valC, valD, valE] = currentSet;

    const observedValues = new Set([valA, valB, valC, valD, valE]);
    const referenceNumbers = [1, 2, 3];
    const missingNumbers = referenceNumbers.filter(num => !observedValues.has(num));

    if (missingNumbers.length === 2 || missingNumbers.length === 0) {
        for (let outputIndex = 0; outputIndex < 5; outputIndex++) {
            console.log(3);
        }
    } else {
        const singularMissing = missingNumbers[0];

        const outputStrategy = {
            1: { // If 1 is missing
                2: 2, // If input is 2, output 2
                _default: 1 // Otherwise output 1
            },
            2: { // If 2 is missing
                1: 2, // If input is 1, output 2
                _default: 1 // Otherwise output 1
            },
            3: { // If 3 is missing
                1: 1, // If input is 1, output 1
                _default: 2 // Otherwise output 2
            }
        };

        currentSet.forEach(inputValue => {
            const specificRuleSet = outputStrategy[singularMissing];
            const finalOutput = specificRuleSet[inputValue] !== undefined ? specificRuleSet[inputValue] : specificRuleSet._default;
            console.log(finalOutput);
        });
    }
}
