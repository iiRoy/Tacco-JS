const fsModule = require("fs");
const inputData = fsModule.readFileSync("/dev/stdin", "utf8");
const dataSegments = inputData.split(/\s/);

let currentSegmentIndex = 0;
let numericValue;

const computeOutput = (inputNum) => {
    const baseValue = inputNum;
    const squaredValue = baseValue * baseValue;
    const sumOfBaseAndSquared = squaredValue + baseValue;
    const adjustedNumerator = sumOfBaseAndSquared + 2;
    const finalResult = adjustedNumerator / 2;
    return finalResult;
};

for (;;) {
    const rawSegment = dataSegments[currentSegmentIndex++];
    numericValue = +rawSegment;

    if (!numericValue) {
        break;
    }
    console.log(computeOutput(numericValue));
}
