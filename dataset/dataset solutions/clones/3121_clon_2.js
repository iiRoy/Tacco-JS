let receivedTextFragments = [];
const LARGE_NUMBER_CONSTANT = 1000000007;
let finalAccumulatedValue = 1;

const systemInputModule = require('readline');

const inputOutputAgent = systemInputModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputOutputAgent.on('line', (currentInputLine) => {
    receivedTextFragments.push(currentInputLine);
});

inputOutputAgent.on('close', () => {
    const elementCount = Number(receivedTextFragments[0]);
    const charArrayRepresentation = receivedTextFragments[1].split("");

    charArrayRepresentation.sort((firstItem, secondItem) => firstItem.charCodeAt(0) - secondItem.charCodeAt(0));

    let frequencyList = [];
    let currentSegmentCount = 1;
    for (let charPosition = 1; charPosition < elementCount; charPosition++) {
        if (charArrayRepresentation[charPosition - 1] !== charArrayRepresentation[charPosition]) {
            frequencyList.push(currentSegmentCount);
            currentSegmentCount = 0;
        }
        currentSegmentCount++;
    }

    frequencyList.push(currentSegmentCount);

    for (let listIndex = 0; listIndex < frequencyList.length; listIndex++) {
        finalAccumulatedValue *= (frequencyList[listIndex] + 1);
    }

    console.log(finalAccumulatedValue - 1);
});