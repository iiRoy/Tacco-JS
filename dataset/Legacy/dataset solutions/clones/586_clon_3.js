function reduceAndTrackMinLength(currentString) {
    const reductionPattern = /1{4,}|2{4,}|3{4,}/g;
    let workingString = currentString;

    let requiresFurtherReduction = reductionPattern.test(workingString);

    while (requiresFurtherReduction) {
        workingString = workingString.replace(reductionPattern, "");
        requiresFurtherReduction = reductionPattern.test(workingString);
    }
    overallMinimumLength = Math.min(overallMinimumLength, workingString.length);
}

let overallMinimumLength = Infinity;

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLinesArray = fileContent.trim().split("\n");

const processAndReduceArray = (arrayToProcess) => {
    reduceAndTrackMinLength(arrayToProcess.join(""));
};

while (true) {
    const numberOfElements = parseInt(inputLinesArray.shift(), 10);

    if (numberOfElements === 0) {
        break;
    }

    const sequenceElements = [];
    for (let index = 0; index < numberOfElements; index++) {
        const elementValue = parseInt(inputLinesArray.shift(), 10);
        sequenceElements.push(elementValue);
    }

    overallMinimumLength = Infinity;

    const lastValidIndex = numberOfElements - 1;

    for (let index = 0; index < numberOfElements; index++) {
        const modifiedSequenceOne = sequenceElements.slice();
        const modifiedSequenceTwo = sequenceElements.slice();

        if (index < lastValidIndex) {
            modifiedSequenceOne[index] = modifiedSequenceOne[index + 1];
        }
        if (index > 0) {
            modifiedSequenceTwo[index] = modifiedSequenceTwo[index - 1];
        }

        processAndReduceArray(modifiedSequenceOne);
        processAndReduceArray(modifiedSequenceTwo);
    }

    console.log(overallMinimumLength);
}
