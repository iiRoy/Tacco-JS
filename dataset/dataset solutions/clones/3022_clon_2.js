var INPUT_HANDLER_FACTORY = (function() {

    function createInputReader(sourceContent) {
        return new StreamProcessor(sourceContent);
    }

    function StreamProcessor(sourceContent) {
        this._sourceLines = sourceContent.trim().split("\n");
        this._linePointer = 0;
    }

    StreamProcessor.prototype.fetchNextToken = function(returnAsString) {
        var currentLines = this._sourceLines,
            currentPointer = this._linePointer,
            extractedToken;

        if (typeof currentLines[currentPointer] === "string") {
            currentLines[currentPointer] = currentLines[currentPointer].split(" ").reverse();
        }

        extractedToken = currentLines[currentPointer].pop();

        if (!currentLines[currentPointer].length) {
            this._linePointer++;
        }
        return returnAsString ? extractedToken : +extractedToken;
    };

    StreamProcessor.prototype.retrieveLineTokens = function(returnAsString) {
        var lineTokens = this._sourceLines[this._linePointer++].split(" ");
        return returnAsString ? lineTokens : lineTokens.map(element => +element);
    };

    StreamProcessor.prototype.obtainMatrix = function(rowsToRead, returnAsString) {
        var matrixData = this._sourceLines.slice(this._linePointer, this._linePointer += rowsToRead).map(element => element.split(" "));
        return returnAsString ? matrixData : matrixData.map(row => row.map(element => +element));
    };

    StreamProcessor.prototype.readLinesAsNumbers = function(linesCount, returnAsString) {
        var numericLines = this._sourceLines.slice(this._linePointer, this._linePointer += linesCount);
        return returnAsString ? numericLines : numericLines.map(element => +element);
    };

    return createInputReader;

})();

var dataProcessor = INPUT_HANDLER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

function generateMultiDimensionalArray(initialValue) {
    var dimensionsSpec = arguments,
        dimensionCount = dimensionsSpec.length,
        arrayCreationCode = "Array(dimensionsSpec[" + --dimensionCount + "]).fill(0).map(element => {return " + initialValue + ";})";

    while (--dimensionCount)
        arrayCreationCode = "Array(dimensionsSpec[" + dimensionCount + "]).fill(0).map(element => " + arrayCreationCode + ")";
    return eval(arrayCreationCode);
}

var PRIME_MODULO_CONSTANT = 998244353;

function performModularMultiplication() {
    for (var operands = arguments, cumulativeProduct = operands[0], operandIndex = 1; operandIndex < operands.length;)
        cumulativeProduct = ((cumulativeProduct >>> 16) * operands[operandIndex] % PRIME_MODULO_CONSTANT * 65536 + (cumulativeProduct & 65535) * operands[operandIndex++]) % PRIME_MODULO_CONSTANT;
    return cumulativeProduct;
}

function calculateModularPower(baseNumber, powerExponent) {
    for (var resultAccumulator = 1; powerExponent; baseNumber = performModularMultiplication(baseNumber, baseNumber), powerExponent >>>= 1)
        if (powerExponent & 1)
            resultAccumulator = performModularMultiplication(baseNumber, resultAccumulator);
    return resultAccumulator;
}

console.log(processAndCalculate());

function processAndCalculate() {
    var datasetSize = dataProcessor.fetchNextToken();
    var inputNumbers = dataProcessor.readLinesAsNumbers(datasetSize).sort((val1, val2) => val1 - val2);
    var totalSumOfNumbers = inputNumbers.reduce((acc, curr) => acc + curr);
    var currentDPTable = [1];

    for (var dataIndex = 0; dataIndex < datasetSize; dataIndex++) {
        var nextDPTable = generateMultiDimensionalArray(0, currentDPTable.length + inputNumbers[dataIndex]);
        for (var currentSumIndex = 0; currentSumIndex < currentDPTable.length; currentSumIndex++) {
            nextDPTable[currentSumIndex] += currentDPTable[currentSumIndex] * 2;
            nextDPTable[currentSumIndex + inputNumbers[dataIndex]] += currentDPTable[currentSumIndex];
            nextDPTable[currentSumIndex] %= PRIME_MODULO_CONSTANT;
        }
        currentDPTable = nextDPTable;
    }

    var finalCalculatedResult = calculateModularPower(3, datasetSize);
    if (totalSumOfNumbers % 2 === 0)
        finalCalculatedResult += computeEvenSumContribution(inputNumbers, datasetSize, totalSumOfNumbers / 2);

    totalSumOfNumbers = (totalSumOfNumbers + 1) >>> 1;

    for (var currentSumIndex = totalSumOfNumbers; currentSumIndex < currentDPTable.length; currentSumIndex++) {
        finalCalculatedResult -= currentDPTable[currentSumIndex] * 3;
    }

    finalCalculatedResult %= PRIME_MODULO_CONSTANT;
    return (finalCalculatedResult + PRIME_MODULO_CONSTANT) % PRIME_MODULO_CONSTANT;
}

function computeEvenSumContribution(itemCollection, collectionSize, targetValue) {
    var partialSumTable = [1];

    for (var itemIterator = 0; itemIterator < collectionSize; itemIterator++) {
        var updatedSumTable = generateMultiDimensionalArray(0, partialSumTable.length + itemCollection[itemIterator]);
        for (var sumIterator = 0; sumIterator < partialSumTable.length; sumIterator++) {
            updatedSumTable[sumIterator] += partialSumTable[sumIterator];
            updatedSumTable[sumIterator + itemCollection[itemIterator]] += partialSumTable[sumIterator];
            updatedSumTable[sumIterator] %= PRIME_MODULO_CONSTANT;
        }
        partialSumTable = updatedSumTable;
    }
    return partialSumTable[targetValue] * 3;
}