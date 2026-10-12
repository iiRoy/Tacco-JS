const inputBuffer = [];
let currentInputIndex = 0;
const inputProcessor = require('readline');

const inputInterface = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

inputInterface.on('line', (lineContent) => {
    inputBuffer.push(lineContent);
});

inputInterface.on('close', () => {
    processAllInputEntries(inputBuffer);
});

function emitResult(valueToOutput) {
    console.log(valueToOutput);
}

function calculateConsecutiveSumCount(targetValue) {
    if (targetValue === 0) {
        return 0;
    }

    const maximumTermsK = Math.floor((Math.sqrt(1 + 8 * targetValue) - 1) / 2);

    const validRepresentationsCount = Array.from(
        { length: Math.max(0, maximumTermsK - 1) },
        (_, index) => index + 2
    )
    .filter(termCount => {
        const sumOfInitialTerms = termCount * (termCount - 1) / 2;
        const remainingValue = targetValue - sumOfInitialTerms;
        return remainingValue > 0 && remainingValue % termCount === 0;
    })
    .length;

    return validRepresentationsCount;
}

function processAllInputEntries(allInputLines) {
    while (currentInputIndex < allInputLines.length) {
        const currentNumericInput = Number(allInputLines[currentInputIndex++]);
        
        if (currentNumericInput === 0) {
            break;
        }
        
        const computedResult = calculateConsecutiveSumCount(currentNumericInput);
        emitResult(computedResult);
    }
}
