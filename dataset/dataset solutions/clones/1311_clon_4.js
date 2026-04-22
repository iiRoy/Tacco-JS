const digitSumExtractor = (numericInput) => {
    let runningTotal = 0;
    let currentFigure = Math.abs(numericInput);
    while (currentFigure > 0) {
        runningTotal += currentFigure % 10;
        currentFigure = Math.floor(currentFigure / 10);
    }
    return runningTotal;
};

const processDataStream = (completeData) => {
    const contentLines = completeData.trim().split('\n');
    const outputCollection = [];

    for (const individualLine of contentLines) {
        const numericInterpretation = parseInt(individualLine, 10);

        if (isNaN(numericInterpretation)) {
            continue;
        }

        if (numericInterpretation === 0) {
            break;
        }

        const computedDigitSum = digitSumExtractor(numericInterpretation);
        outputCollection.push(computedDigitSum);
    }

    outputCollection.forEach(resultItem => process.stdout.write(resultItem + '\n'));
};

processDataStream(require('node:fs').readFileSync('/dev/stdin', 'utf8'));