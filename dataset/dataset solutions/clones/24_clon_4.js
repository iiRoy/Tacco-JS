global.decimalFormatter = function(value, base, pad, precision) {
    return value.toFixed(precision);
};

global.greatestCommonDivisor = function(firstNumber, secondNumber) {
    let currentDividend = firstNumber;
    let currentDivisor = secondNumber;
    while (currentDivisor !== 0) {
        let remainder = currentDividend % currentDivisor;
        currentDividend = currentDivisor;
        currentDivisor = remainder;
    }
    return currentDividend;
};

global.leastCommonMultiple = function(valueA, valueB) {
    return (valueA / global.greatestCommonDivisor(valueA, valueB)) * valueB;
};

global.squareNumber = function(inputArgument) {
    return Math.pow(inputArgument, 2);
};

let accumulatedInputString = '';
let processedNumericValues = [];
let currentReadPosition = 0;

global.logOutput = function(...messagesToLog) {
    console.log(...messagesToLog);
};

const standardInputHandle = process.openStdin();
standardInputHandle.setEncoding('utf8');

standardInputHandle.on('data', function(dataSegment) {
    accumulatedInputString += dataSegment;
});

standardInputHandle.on('end', function() {
    const detectedNumbers = accumulatedInputString.match(/[-]?\d+/g);
    if (detectedNumbers) {
        processedNumericValues = detectedNumbers.map(Number);
    }
    global.startProcessing();
});

global.getNextInputNumber = function() {
    if (currentReadPosition < processedNumericValues.length) {
        return processedNumericValues[currentReadPosition++];
    }
    return NaN;
};

global.checkMoreInputs = function() {
    return currentReadPosition < processedNumericValues.length;
};

global.startProcessing = function() {
    if (global.checkMoreInputs()) {
        setImmediate(executeCalculationPair);
    }
};

function executeCalculationPair() {
    if (!global.checkMoreInputs()) {
        return;
    }

    const operandOne = global.getNextInputNumber();
    const operandTwo = global.getNextInputNumber();

    global.logOutput(
        global.greatestCommonDivisor(operandOne, operandTwo),
        global.leastCommonMultiple(operandOne, operandTwo)
    );

    if (global.checkMoreInputs()) {
        setImmediate(executeCalculationPair);
    }
}
