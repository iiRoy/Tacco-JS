const newLineChar = '\n';

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);
const processedInputElements = rawInputContent.split(/\s|,/);

const elementOccurrenceCounters = {
    countForA: 0,
    countForB: 0,
    countForOther: 0,
    countForO: 0
};

function updateElementCounts(valueToEvaluate, counterObject) {
    if (valueToEvaluate === 'A') {
        counterObject.countForA++;
    } else if (valueToEvaluate === 'B') {
        counterObject.countForB++;
    } else if (valueToEvaluate === 'O') {
        counterObject.countForO++;
    } else {
        counterObject.countForOther++;
    }
}

let loopIterationIndex = -1;
let currentProcessedItem;

while ((currentProcessedItem = processedInputElements[loopIterationIndex += 2])) {
    console.log(loopIterationIndex, currentProcessedItem);
    updateElementCounts(currentProcessedItem, elementOccurrenceCounters);
}

const finalResultString = elementOccurrenceCounters.countForA + newLineChar +
                          elementOccurrenceCounters.countForB + newLineChar +
                          elementOccurrenceCounters.countForOther + newLineChar +
                          elementOccurrenceCounters.countForO;

console.log(finalResultString);
