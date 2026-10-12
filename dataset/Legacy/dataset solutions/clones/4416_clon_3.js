function getStdinContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

const RADIX_DECIMAL_BASE = 10;

function parseNumericString(numericString) {
    return parseInt(numericString, RADIX_DECIMAL_BASE);
}

function processRawInputString(rawInputData) {
    const stringSegments = rawInputData.split(" ");
    const numericSegments = [];
    for (let i = 0; i < stringSegments.length; i++) {
        numericSegments.push(parseNumericString(stringSegments[i]));
    }
    return numericSegments;
}

function ProcessIntervals(rawData) {
    const parsedNumericValues = processRawInputString(rawData);

    const firstIntervalStart = parsedNumericValues[0];
    const firstIntervalEnd = parsedNumericValues[1];
    const secondIntervalStart = parsedNumericValues[2];
    const secondIntervalEnd = parsedNumericValues[3];

    let calculatedIntersectionLength = 0;

    const isNoOverlapConditionMet = secondIntervalStart >= firstIntervalEnd || secondIntervalEnd <= firstIntervalStart;

    if (isNoOverlapConditionMet) {
        calculatedIntersectionLength = 0;
    } else {
        let actualIntersectionStart;
        if (firstIntervalStart < secondIntervalStart) {
            actualIntersectionStart = secondIntervalStart;
        } else {
            actualIntersectionStart = firstIntervalStart;
        }

        let actualIntersectionEnd;
        if (firstIntervalEnd < secondIntervalEnd) {
            actualIntersectionEnd = firstIntervalEnd;
        } else {
            actualIntersectionEnd = secondIntervalEnd;
        }

        calculatedIntersectionLength = actualIntersectionEnd - actualIntersectionStart;
    }

    console.log('%d', calculatedIntersectionLength);
}

ProcessIntervals(getStdinContent());
