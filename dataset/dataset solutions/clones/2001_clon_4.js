function extractNumericValue(segment) {
    let numericalRepresentation = 0;
    let signModifier = 1;
    let charIndex = 0;

    if (segment.length === 0) {
        return 0;
    }

    if (segment[0] === '-') {
        signModifier = -1;
        charIndex = 1;
    }

    for (let i = charIndex; i < segment.length; i++) {
        const digit = segment.charCodeAt(i) - '0'.charCodeAt(0);
        if (digit < 0 || digit > 9) {
            break;
        }
        numericalRepresentation = numericalRepresentation * 10 + digit;
    }
    return numericalRepresentation * signModifier;
}

function disassembleLineIntoNumbers(lineText) {
    const numberList = [];
    let currentSegmentStart = 0;
    for (let i = 0; i < lineText.length; i++) {
        if (lineText[i] === ' ') {
            if (currentSegmentStart < i) {
                numberList.push(extractNumericValue(lineText.substring(currentSegmentStart, i)));
            }
            currentSegmentStart = i + 1;
        }
    }
    if (currentSegmentStart < lineText.length) {
        numberList.push(extractNumericValue(lineText.substring(currentSegmentStart, lineText.length)));
    }
    return numberList;
}

function computeSummation(numericalArray) {
    let totalAccumulator = 0;
    for (let i = 0; i < numericalArray.length; i++) {
        totalAccumulator += numericalArray[i];
    }
    return totalAccumulator;
}

function determineNthLargest(allValuesCollection, countForSelection) {
    let currentTopValues = [];

    for (let i = 0; i < countForSelection; i++) {
        currentTopValues.push(Number.MIN_SAFE_INTEGER);
    }

    for (let i = 0; i < allValuesCollection.length; i++) {
        const observedValue = allValuesCollection[i];

        if (observedValue > currentTopValues[0]) {
            currentTopValues[0] = observedValue;

            for (let k = 0; k < countForSelection - 1; k++) {
                if (currentTopValues[k] > currentTopValues[k+1]) {
                    const temporaryHolder = currentTopValues[k];
                    currentTopValues[k] = currentTopValues[k+1];
                    currentTopValues[k+1] = temporaryHolder;
                } else {
                    break;
                }
            }
        }
    }
    return currentTopValues[0];
}

function processContestData(rawDataString) {
    let outcomeIndicator = "YES";

    let firstNewlinePos = -1;
    let secondNewlinePos = -1;
    for(let i = 0; i < rawDataString.length; i++) {
        if (rawDataString[i] === '\n') {
            if (firstNewlinePos === -1) {
                firstNewlinePos = i;
            } else {
                secondNewlinePos = i;
                break;
            }
        }
    }

    let lineOne = rawDataString.substring(0, firstNewlinePos);
    let lineTwo = rawDataString.substring(firstNewlinePos + 1, secondNewlinePos === -1 ? rawDataString.length : secondNewlinePos);

    lineOne = lineOne.replace(/^\s+|\s+$/g, '');
    lineTwo = lineTwo.replace(/^\s+|\s+$/g, '');

    const dimensionParameters = disassembleLineIntoNumbers(lineOne);
    const totalElements = dimensionParameters[0];
    const selectionSize = dimensionParameters[1];

    const dataSeries = disassembleLineIntoNumbers(lineTwo);

    const cumulativeSum = computeSummation(dataSeries);
    const minimumOfSelected = determineNthLargest(dataSeries, selectionSize);

    const comparisonFactor = cumulativeSum / (4 * selectionSize);

    if (minimumOfSelected < comparisonFactor) {
        outcomeIndicator = "NO";
    }

    console.log(outcomeIndicator);
}

processContestData(require("fs").readFileSync("/dev/stdin", "utf8"));