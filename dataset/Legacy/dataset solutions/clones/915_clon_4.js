const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const allLines = fileContent.split("\n");

function* lineIterator(lines) {
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        yield lines[currentLineIndex++];
    }
}

const dataStream = lineIterator(allLines);

const vowelCheckPattern = /[aiueo]/;

const determineSharedPrefixLength = (firstString, secondString, currentPosition = 0) => {
    if (currentPosition >= firstString.length || currentPosition >= secondString.length) {
        if (firstString.length === secondString.length) {
            return -1;
        }
        return Math.min(firstString.length, secondString.length);
    }
    if (firstString[currentPosition] !== secondString[currentPosition]) {
        return currentPosition;
    }
    return determineSharedPrefixLength(firstString, secondString, currentPosition + 1);
};

while (true) {
    const quantityOfNames = +dataStream.next().value;
    if (quantityOfNames === 0) {
        break;
    }

    const rawNameList = Array.from({ length: quantityOfNames }, () => dataStream.next().value);

    const processedAndSortedNames = rawNameList.map(originalName => {
        const transformationResult = Array.from(originalName).reduce((accumulator, character) => {
            let currentTransformed = accumulator.processedPart;
            let shouldCaptureNext = accumulator.captureFlag;

            if (shouldCaptureNext) {
                currentTransformed += character;
                shouldCaptureNext = false;
            }
            if (vowelCheckPattern.test(character)) {
                shouldCaptureNext = true;
            }
            return { processedPart: currentTransformed, captureFlag: shouldCaptureNext };
        }, { processedPart: "", captureFlag: true });
        return transformationResult.processedPart;
    }).sort();

    const initialComparisonState = { maximumPrefix: 0, hasExactMatch: false };

    const finalComparisonOutcome = processedAndSortedNames.slice(1).reduce((currentStatus, currentEntry, indexInSlice) => {
        if (currentStatus.hasExactMatch) {
            return currentStatus;
        }
        const priorEntry = processedAndSortedNames[indexInSlice];
        const commonality = determineSharedPrefixLength(priorEntry, currentEntry);

        if (commonality === -1) {
            return { maximumPrefix: -2, hasExactMatch: true };
        }
        return {
            maximumPrefix: Math.max(currentStatus.maximumPrefix, commonality),
            hasExactMatch: false
        };
    }, initialComparisonState);

    console.log(finalComparisonOutcome.maximumPrefix + 1);
}
