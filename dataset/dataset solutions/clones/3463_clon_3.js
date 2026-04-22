const parseIntegerVal = (stringValue) => {
    const RADIX_BASE_DECIMAL = 10;
    return parseInt(stringValue.trim(), RADIX_BASE_DECIMAL);
};

function determineLargestValue(...numericalArguments) {
    const collectionOfValues = numericalArguments;
    if (collectionOfValues.length === 0) {
        return Number.NEGATIVE_INFINITY;
    }

    let currentHighestValue = collectionOfValues[0];
    let processingIndex = 1;

    while (processingIndex < collectionOfValues.length) {
        const valueToCompare = collectionOfValues[processingIndex];
        if (valueToCompare > currentHighestValue) {
            currentHighestValue = valueToCompare;
        }
        processingIndex++;
    }
    return currentHighestValue;
}

try {
    const fileSystemHandler = require("fs");
    const standardInputPath = "/dev/stdin";
    const textEncoding = "utf8";

    const rawInputTextContent = fileSystemHandler.readFileSync(standardInputPath, textEncoding);

    executeCoreProcessing(rawInputTextContent);

} catch (inputReadError) {
    console.error("Critical error during input acquisition:", inputReadError.message);
    process.exit(1);
}

function executeCoreProcessing(rawInputTextPayload) {
    if (typeof rawInputTextPayload !== 'string' || rawInputTextPayload.trim().length === 0) {
        console.error("Input processing aborted: Provided data is either not a string or is empty.");
        return 1;
    }

    const inputLinesArray = rawInputTextPayload.split('\n');

    if (inputLinesArray.length === 0 || inputLinesArray[0].trim().length === 0) {
        console.error("Input processing aborted: First line containing element count is missing or empty.");
        return 1;
    }
    const overallElementCount = parseIntegerVal(inputLinesArray[0]);

    if (isNaN(overallElementCount) || overallElementCount < 0) {
        console.error("Input processing aborted: Invalid or negative element count detected.");
        return 1;
    }

    const parsedNumericDataCollection = [];
    let currentLineCursor = 0;

    while (currentLineCursor < overallElementCount) {
        const sourceLineIndex = currentLineCursor + 1;

        if (sourceLineIndex >= inputLinesArray.length) {
            console.warn(`Warning: Expected ${overallElementCount} data elements but only found ${currentLineCursor}.`);
            break;
        }

        const currentNumericalString = inputLinesArray[sourceLineIndex];
        const convertedNumber = parseIntegerVal(currentNumericalString);

        if (isNaN(convertedNumber)) {
            console.error(`Error: Non-numeric value detected on line ${sourceLineIndex + 1}: '${currentNumericalString}'. Skipping this entry.`);
            currentLineCursor++;
            continue;
        }
        parsedNumericDataCollection.push(convertedNumber);
        currentLineCursor++;
    }

    parsedNumericDataCollection.sort((valueA, valueB) => {
        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    });

    let firstAccumulatedTotal = 0;
    let secondAccumulatedTotal = 0;

    const isCountAnEvenNumber = (parsedNumericDataCollection.length % 2) === 0;

    if (isCountAnEvenNumber) {
        const midCountPosition = parsedNumericDataCollection.length / 2;
        let iterationPointer = 0;

        while (iterationPointer < parsedNumericDataCollection.length) {
            const currentDataPoint = parsedNumericDataCollection[iterationPointer];
            if (iterationPointer >= midCountPosition) {
                firstAccumulatedTotal = firstAccumulatedTotal + (2 * currentDataPoint);
            } else {
                firstAccumulatedTotal = firstAccumulatedTotal - (2 * currentDataPoint);
            }
            iterationPointer++;
        }
        
        const middleElementVal = parsedNumericDataCollection[midCountPosition];
        const nextMiddleElementVal = parsedNumericDataCollection[midCountPosition + 1];
        firstAccumulatedTotal = firstAccumulatedTotal + middleElementVal - nextMiddleElementVal;

    } else {
        const centralIndex = (parsedNumericDataCollection.length - 1) / 2;
        const subsequentCentralIndex = (parsedNumericDataCollection.length + 1) / 2;
        const precedingCentralIndex = (parsedNumericDataCollection.length - 3) / 2;

        for (let idx = 0; idx < parsedNumericDataCollection.length; idx++) {
            const dataElement = parsedNumericDataCollection[idx];

            if (idx >= centralIndex) {
                firstAccumulatedTotal = firstAccumulatedTotal + (2 * dataElement);
            } else {
                firstAccumulatedTotal = firstAccumulatedTotal - (2 * dataElement);
            }

            if (idx > centralIndex) {
                secondAccumulatedTotal = secondAccumulatedTotal + (2 * dataElement);
            } else {
                secondAccumulatedTotal = secondAccumulatedTotal - (2 * dataElement);
            }
        }
        
        const centralElementValue = parsedNumericDataCollection[centralIndex];
        const nextCentralElementValue = parsedNumericDataCollection[subsequentCentralIndex];
        const previousCentralElementValue = parsedNumericDataCollection[precedingCentralIndex];

        firstAccumulatedTotal = firstAccumulatedTotal - (centralElementValue + nextCentralElementValue);
        secondAccumulatedTotal = secondAccumulatedTotal + (centralElementValue + previousCentralElementValue);
    }

    const ultimateOutcome = determineLargestValue(firstAccumulatedTotal, secondAccumulatedTotal);

    console.log(ultimateOutcome);

    return 0;
}