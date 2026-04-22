process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedInput = '';

const displayResult = console.log;

process.stdin.on('data', (inputPart) => {
    collectedInput += inputPart;
});

process.stdin.on('end', () => {
    const rawLines = collectedInput.split('\n');
    const cleanedNumbersAsStrings = rawLines.filter(currentLine => currentLine.trim() !== '');

    const numericalValues = cleanedNumbersAsStrings.map(valueString => parseInt(valueString, 10));

    handleDataSegments(numericalValues);
});

function handleDataSegments(sourceList) {
    if (sourceList.length < 2) {
        return;
    }

    const currentSegmentLength = sourceList[0];
    const workingSegment = sourceList.slice(1, 1 + currentSegmentLength);
    const subsequentSegments = sourceList.slice(1 + currentSegmentLength);

    let temporaryProcessingArray = [...workingSegment];

    let detectedMinimum = Infinity;
    if (temporaryProcessingArray.length > 0) {
        detectedMinimum = temporaryProcessingArray[0];
        for (let i = 1; i < temporaryProcessingArray.length; i++) {
            if (temporaryProcessingArray[i] < detectedMinimum) {
                detectedMinimum = temporaryProcessingArray[i];
            }
        }
    }

    let minimumElementRemoved = false;
    temporaryProcessingArray = temporaryProcessingArray.filter(itemValue => {
        if (!minimumElementRemoved && itemValue === detectedMinimum) {
            minimumElementRemoved = true;
            return false;
        }
        return true;
    });

    let detectedMaximum = -Infinity;
    if (temporaryProcessingArray.length > 0) {
        detectedMaximum = temporaryProcessingArray[0];
        for (let i = 1; i < temporaryProcessingArray.length; i++) {
            if (temporaryProcessingArray[i] > detectedMaximum) {
                detectedMaximum = temporaryProcessingArray[i];
            }
        }
    }

    let maximumElementRemoved = false;
    temporaryProcessingArray = temporaryProcessingArray.filter(itemValue => {
        if (!maximumElementRemoved && itemValue === detectedMaximum) {
            maximumElementRemoved = true;
            return false;
        }
        return true;
    });

    let totalAccumulated = 0;
    for (let j = 0; j < temporaryProcessingArray.length; j++) {
        totalAccumulated += temporaryProcessingArray[j];
    }

    displayResult(Math.floor(totalAccumulated / temporaryProcessingArray.length));

    handleDataSegments(subsequentSegments);
}