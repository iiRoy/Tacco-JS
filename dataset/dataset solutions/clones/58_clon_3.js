if (!String.prototype.removeBoundaryWhitespace) {
    String.prototype.removeBoundaryWhitespace = function() {
        return this.trim();
    };
}

if (!String.prototype.segmentByDelimiter) {
    String.prototype.segmentByDelimiter = function(delimiter) {
        return this.split(delimiter);
    };
}

const fileSystemUtility = require("fs");

const inputSourceIdentifier = "/dev/stdin";
const characterEncodingStandard = "utf8";
const primaryCalculationLimit = 600;

const outputResultToConsole = console.log;

function deriveWeightedDecrementalSum(inputNumericalValue) {
    if (Number.isNaN(inputNumericalValue)) {
        return Number.NaN;
    }

    if (inputNumericalValue === 0) {
        return 0;
    }

    let cumulativeAggregatedSum = 0;
    let iteratingDecrementCounter = primaryCalculationLimit;

    while (true) {
        iteratingDecrementCounter -= inputNumericalValue;
        if (iteratingDecrementCounter <= 0) {
            break;
        }
        cumulativeAggregatedSum += (iteratingDecrementCounter * iteratingDecrementCounter * inputNumericalValue);
    }

    return cumulativeAggregatedSum;
}

try {
    const rawFileContentBuffer = fileSystemUtility.readFileSync(inputSourceIdentifier, characterEncodingStandard);

    const processedInputLines = rawFileContentBuffer
                                .removeBoundaryWhitespace()
                                .segmentByDelimiter('\n');

    const finalComputedValues = processedInputLines.map(singleLineText => {
        const parsedNumericInput = Number(singleLineText);
        return deriveWeightedDecrementalSum(parsedNumericInput);
    });

    finalComputedValues.forEach(calculatedResult => {
        outputResultToConsole(calculatedResult);
    });

} catch (processingError) {
    outputResultToConsole("An unexpected error interrupted the program execution:");
    outputResultToConsole(processingError.message);
}