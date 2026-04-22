class InputLineManager {
    constructor() {
        this.capturedLines = [];
        this.linePointer = 0;
    }

    feedLine(lineContent) {
        this.capturedLines.push(lineContent);
    }

    hasMoreLines() {
        return this.linePointer < this.capturedLines.length;
    }

    obtainNextLine() {
        if (!this.hasMoreLines()) {
            throw new Error("InputBufferDepleted: No more lines available.");
        }
        return this.capturedLines[this.linePointer++];
    }
}

const ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const inputDataStore = new InputLineManager();

ioInterface.on('line', (dataLine) => {
    inputDataStore.feedLine(dataLine);
});

ioInterface.on('close', () => {
    const programStartTime = process.hrtime.bigint();
    mainExecutionPoint();
    const programEndTime = process.hrtime.bigint();
    const durationMs = Number(programEndTime - programStartTime) / 1_000_000;
    sendDebugLog("--- process_end ---");
    sendDebugLog("time : " + durationMs.toFixed(3) + "ms");
    sendDebugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

const dataConversionMap = new Map([
    [1, (value) => Number(value)],
    [2, (value) => value.split(" ")],
    [4, (value) => value.split(" ").map(Number)],
    [6, (value) => value.split("")],
    [7, (value) => value.split("").map(Number)],
    [8, (value) => value.join(" ")],
    [9, (value) => value.join("\n")],
    [0, (value) => value.join("")],
]);

const performConversion = (valueToConvert, typeCode) => {
    try {
        const converter = dataConversionMap.get(typeCode);
        return converter ? converter(valueToConvert) : valueToConvert;
    } catch (e) {
        return valueToConvert;
    }
};

const getInteger = () => performConversion(inputDataStore.obtainNextLine(), 1);
const getStringList = () => performConversion(inputDataStore.obtainNextLine(), 2);
const getNumberList = () => performConversion(inputDataStore.obtainNextLine(), 4);
const getCharacterList = () => performConversion(inputDataStore.obtainNextLine(), 6);
const retrieveLine = () => inputDataStore.obtainNextLine();
const checkMoreInput = () => inputDataStore.hasMoreLines();

const sendOutput = (content) => console.log(content);
const sendDebugLog = (content) => console.error("diagnostic_trace:" + require("util").inspect(content, { colors: true, depth: null }));

const applyReducedModulus = (initialValue, baseDivisor) => {
    if (initialValue < baseDivisor) return initialValue;
    return (initialValue % baseDivisor === 0)
        ? applyReducedModulus(initialValue / baseDivisor, baseDivisor)
        : initialValue % baseDivisor;
};

const findNaturalFactors = (targetNumber) => {
    const factors = new Set();
    const limit = Math.floor(Math.sqrt(targetNumber));

    Array.from({ length: limit }, (_, i) => i + 1).forEach(candidate => {
        if (targetNumber % candidate === 0) {
            factors.add(candidate);
            if (candidate * candidate !== targetNumber) {
                factors.add(targetNumber / candidate);
            }
        }
    });
    return [...factors].sort((a, b) => a - b);
};

const testPrimality = (testCandidate) => {
    if (testCandidate === null || testCandidate <= 1 || (testCandidate !== 2 && testCandidate % 2 === 0)) {
        return false;
    }
    if (testCandidate === 2 || testCandidate === 3) {
        return true;
    }
    if (testCandidate % 3 === 0) {
        return false;
    }
    const checkLimit = Math.floor(Math.sqrt(testCandidate));
    for (let k = 5; k <= checkLimit; k += 6) {
        if (testCandidate % k === 0 || testCandidate % (k + 2) === 0) {
            return false;
        }
    }
    return true;
};

const primeFactorize = (numValue) => {
    const primeOccurrences = new Map();
    let remainingValue = numValue;

    for (let divisor = 2; divisor * divisor <= remainingValue; /* no increment here */) {
        if (remainingValue % divisor === 0) {
            primeOccurrences.set(divisor, (primeOccurrences.get(divisor) || 0) + 1);
            remainingValue /= divisor;
        } else {
            divisor = (divisor === 2) ? 3 : divisor + 2;
        }
    }

    if (remainingValue > 1) {
        primeOccurrences.set(remainingValue, (primeOccurrences.get(remainingValue) || 0) + 1);
    }
    return primeOccurrences;
};

function mainExecutionPoint() {
    sendDebugLog("--- process_start ---");

    const queryValue = getInteger();

    const factorsOfQueryValue = findNaturalFactors(queryValue);
    const factorsOfPredecessor = findNaturalFactors(queryValue - 1);

    const resultSet = new Set();

    factorsOfPredecessor.filter(factor => factor > 1).forEach(factor => {
        resultSet.add(factor);
    });

    factorsOfQueryValue.filter(factor => factor > 1).forEach(factor => {
        if (applyReducedModulus(queryValue, factor) === 1) {
            resultSet.add(factor);
        }
    });

    sendOutput(resultSet.size);
}