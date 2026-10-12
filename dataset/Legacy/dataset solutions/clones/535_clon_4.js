const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputString = rawInputContent.trim();

let collectedNumericSegments = [];
let currentSegmentAccumulator = '';

for (let charIndex = 0; charIndex < processedInputString.length; charIndex++) {
    const currentChar = processedInputString[charIndex];

    if (currentChar === ' ') {
        collectedNumericSegments.push(Number(currentSegmentAccumulator));
        currentSegmentAccumulator = '';
        if (collectedNumericSegments.length >= 2) {
            break;
        }
    } else {
        currentSegmentAccumulator += currentChar;
    }
}

collectedNumericSegments.push(Number(currentSegmentAccumulator));

const firstOperand = collectedNumericSegments[0];
const secondOperand = collectedNumericSegments[1];

const computedAverage = (firstOperand + secondOperand) * 0.5;

console.log(computedAverage);
