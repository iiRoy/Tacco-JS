const fileSystem = require("fs");
const standardInputPath = "/dev/stdin";

const rawSourceData = fileSystem.readFileSync(standardInputPath, "utf8");
const dataSegments = rawSourceData.split(/\s/);

const processNumberTransform = (inputNum) => {
    const squareVal = inputNum * inputNum;
    const sumVal = squareVal + inputNum;
    const addTwo = sumVal + 2;
    return addTwo / 2;
};

const processInputSegment = (segmentCollection, currentIdx) => {
    if (currentIdx >= segmentCollection.length) {
        return;
    }

    const currentSegment = segmentCollection[currentIdx];
    const numericConversion = Number(currentSegment);

    // Mimic original loop termination: `for(...; i; ...)` terminates if `i` is falsy.
    // `+""` results in 0 (falsy). `+undefined` results in NaN (falsy).
    // So, if numericConversion is 0 (from "0" or "") or NaN (from undefined/non-numeric),
    // the loop terminates *before* processing that value.
    if (!numericConversion) {
        return;
    }

    if (!isNaN(numericConversion)) {
        const computedOutcome = processNumberTransform(numericConversion);
        process.stdout.write(computedOutcome + "\n");
    }

    processInputSegment(segmentCollection, currentIdx + 1);
};

processInputSegment(dataSegments, 0);