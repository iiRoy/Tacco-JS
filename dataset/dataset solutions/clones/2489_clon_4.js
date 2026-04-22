function processExternalData(rawInputData) {
    const lineSections = rawInputData.split('\n');
    const targetPayload = lineSections[1];

    let tokenCollection = [];
    let currentTokenBuffer = "";
    let previousCharWasSeparator = true;

    for (let charIndex = 0; charIndex < targetPayload.length; charIndex++) {
        const currentCharacter = targetPayload[charIndex];
        if (currentCharacter === ' ') {
            if (!previousCharWasSeparator) {
                tokenCollection.push(currentTokenBuffer);
                currentTokenBuffer = "";
            }
            previousCharWasSeparator = true;
        } else {
            currentTokenBuffer += currentCharacter;
            previousCharWasSeparator = false;
        }
    }
    if (currentTokenBuffer !== "" || previousCharWasSeparator) {
        tokenCollection.push(currentTokenBuffer);
    }

    let numericalSequence = [];
    for (const segment of tokenCollection) {
        let convertedValue = 0;
        let cursorPosition = 0;
        let digitEncountered = false;

        while (cursorPosition < segment.length && segment[cursorPosition] === ' ') {
            cursorPosition++;
        }

        if (cursorPosition === segment.length) {
            numericalSequence.push(NaN);
            continue;
        }

        let isSegmentNaN = false;
        while (cursorPosition < segment.length) {
            const char = segment[cursorPosition];
            if (char >= '0' && char <= '9') {
                convertedValue = convertedValue * 10 + (char - '0');
                digitEncountered = true;
            } else {
                if (digitEncountered) {
                    break;
                } else {
                    numericalSequence.push(NaN);
                    isSegmentNaN = true;
                    break;
                }
            }
            cursorPosition++;
        }
        if (!isSegmentNaN) {
            if (!digitEncountered) {
                numericalSequence.push(NaN);
            } else {
                numericalSequence.push(convertedValue);
            }
        }
    }
    return numericalSequence;
}

function aggregateValues(valueStream) {
    let accumulatedSum = 0;
    let accumulatedSquaredSum = 0;
    let containsNaN = false;

    for (let singleValue of valueStream) {
        if (isNaN(singleValue)) {
            containsNaN = true;
            break;
        }
        accumulatedSum += singleValue;
        accumulatedSquaredSum += singleValue * singleValue;
    }

    if (containsNaN) {
        return { totalSum: NaN, totalSquaredSum: NaN };
    }
    return { totalSum: accumulatedSum, totalSquaredSum: accumulatedSquaredSum };
}

function executeSystemLogic(receivedSourceData) {
    let parsedNumbers = processExternalData(receivedSourceData);
    let summaryMetrics = aggregateValues(parsedNumbers);

    if (isNaN(summaryMetrics.totalSum)) {
        console.log(NaN);
        return;
    }

    let finalResult = (summaryMetrics.totalSum * summaryMetrics.totalSum - summaryMetrics.totalSquaredSum) / 2;
    console.log(finalResult);
}

executeSystemLogic(require("fs").readFileSync("/dev/stdin", "utf8"));