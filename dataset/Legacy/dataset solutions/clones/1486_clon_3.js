const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataRows = rawData.split('\n');

const firstLineParts = dataRows[0].split(' ');
let numElements = Number(firstLineParts[0]);
let rangeOffset = Number(firstLineParts[1]);

const dynamicProgression = new Array(300001).fill(0);

for (let idx = 1; idx <= numElements; ++idx) {
    const currentLineValueStr = dataRows[idx];
    const currentValue = parseInt(currentLineValueStr, 10);

    const potentialNewValue = dynamicProgression[currentValue] + 1;

    const rawLowerBoundCalc = currentValue - rangeOffset;
    const lowerBound = Math.max(0, rawLowerBoundCalc);

    const upperBound = currentValue + rangeOffset;

    for (let rangeIdx = lowerBound; rangeIdx <= upperBound; ++rangeIdx) {
        dynamicProgression[rangeIdx] = Math.max(potentialNewValue, dynamicProgression[rangeIdx]);
    }
}

let overallMaximum = 0;
for (let k = 0; k < dynamicProgression.length; ++k) {
    const currentDpValue = dynamicProgression[k];
    if (currentDpValue > overallMaximum) {
        overallMaximum = currentDpValue;
    }
}

console.log(overallMaximum);
