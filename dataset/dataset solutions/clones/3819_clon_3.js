const isSequentialIncrement = (currentValue, previousValue) => {
    return (currentValue - previousValue) === 1;
};

function processNumericalSeries(inputDataAsString) {
    if (typeof inputDataAsString !== 'string' || inputDataAsString.trim().length === 0) {
        console.error("Error: Input data must be a non-empty string for processing.");
        console.log(-1);
        return;
    }

    const rawLines = inputDataAsString.split('\n');
    const processedNumbers = [];
    for (const line of rawLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) {
            continue; // Skip empty lines
        }
        const parsedNumber = Number(trimmedLine);
        if (isNaN(parsedNumber)) {
            console.error(`Warning: Encountered non-numeric data "${trimmedLine}". Skipping this line.`);
            // Depending on strictness, could return -1 here. For now, we'll just skip.
            continue;
        }
        processedNumbers.push(parsedNumber);
    }

    if (processedNumbers.length < 2) {
        console.error("Error: Insufficient numerical data points provided (expected at least 2).");
        console.log(-1);
        return;
    }

    let seriesLengthIndicator = processedNumbers[0];

    if (processedNumbers[1] !== 0) {
        console.log(-1);
        return;
    }

    let cumulativeSum = 0;
    let calculationExecuted = false;

    let currentIterationIndex = seriesLengthIndicator;
    while (currentIterationIndex > 1) {
        const currentElementValue = processedNumbers[currentIterationIndex];
        const previousElementValue = processedNumbers[currentIterationIndex - 1];

        if (isSequentialIncrement(currentElementValue, previousElementValue)) {
            cumulativeSum = cumulativeSum + 1;
        } else {
            cumulativeSum = cumulativeSum + currentElementValue;
        }

        currentIterationIndex = currentIterationIndex - 1;
        calculationExecuted = true;
    }

    if (calculationExecuted || seriesLengthIndicator <= 1) {
        console.log(cumulativeSum);
    } else {
        console.error("Unexpected path: Calculation did not execute as expected.");
        console.log(-1);
    }
}

(function executeProcessingPipeline() {
    let fileContent = '';
    try {
        fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        console.error("Error during file read operation from /dev/stdin:", ioError.message);
        console.log(-1);
        return;
    }

    processNumericalSeries(fileContent);
})();