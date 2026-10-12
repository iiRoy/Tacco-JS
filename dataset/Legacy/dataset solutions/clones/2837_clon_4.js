const outputWriter = console.log;

const rawInputBuffer = require("fs").readFileSync("/dev/stdin", "UTF-8");
const processedInputString = rawInputBuffer.toString().trim();

let firstNumericComponent;
let secondNumericComponent;
let currentSegment = '';
let componentCount = 0;

for (let charIndex = 0; charIndex < processedInputString.length; charIndex++) {
    const currentChar = processedInputString[charIndex];

    if (currentChar === ' ') {
        if (currentSegment !== '') {
            if (componentCount === 0) {
                firstNumericComponent = currentSegment;
            } else if (componentCount === 1) {
                secondNumericComponent = currentSegment;
            }
            componentCount++;
            currentSegment = '';
        }
        while (charIndex + 1 < processedInputString.length && processedInputString[charIndex + 1] === ' ') {
            charIndex++;
        }
    } else {
        currentSegment += currentChar;
    }

    if (componentCount === 2) {
        break;
    }
}

if (currentSegment !== '') {
    if (componentCount === 0) {
        firstNumericComponent = currentSegment;
    } else if (componentCount === 1) {
        secondNumericComponent = currentSegment;
    }
    componentCount++;
}

const valA = Number(firstNumericComponent);
const valB = Number(secondNumericComponent);

const computedOutcome = (valB === 1) ? 0 : (valA - valB);

outputWriter(computedOutcome);
