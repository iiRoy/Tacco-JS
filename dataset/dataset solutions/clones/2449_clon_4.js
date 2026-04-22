const fileSystem = require("fs");
const sourceDataContent = fileSystem.readFileSync("/dev/stdin", "utf8").trim();
const lineSegments = sourceDataContent.split("\n");
let currentSegmentIndex = 0;

const obtainNextSegment = () => {
    if (currentSegmentIndex >= lineSegments.length) {
        return "";
    }
    const currentItem = lineSegments[currentSegmentIndex];
    currentSegmentIndex++;
    return currentItem;
};

const hasFurtherSegments = () => {
    return currentSegmentIndex < lineSegments.length;
};

const conversionHandlers = {
    1: (val) => Number(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join(""),
    default: (val) => val
};

const performTransformation = (incomingValue, transformKey) => {
    try {
        const handler = conversionHandlers[transformKey] || conversionHandlers.default;
        return handler(incomingValue);
    } catch (e) {
        return incomingValue;
    }
};

const acquireLineContent = () => obtainNextSegment();
const acquireNumericalValue = () => performTransformation(acquireLineContent(), 1);
const acquireWordList = () => performTransformation(acquireLineContent(), 2);
const acquireNumericList = () => performTransformation(acquireLineContent(), 4);
const acquireCharacterList = () => performTransformation(acquireLineContent(), 6);
const hasMoreSourceLines = () => hasFurtherSegments();

const printToStandardOutput = (data) => console.log(data);
const printToStandardError = (data) => console.error(data);

const runPrimaryProcess = () => {
    const generatedItems = Array.from({ length: 10000 }, () => "-1");
    const combinedResultString = performTransformation(generatedItems, 9);
    printToStandardOutput(combinedResultString);
};

runPrimaryProcess();