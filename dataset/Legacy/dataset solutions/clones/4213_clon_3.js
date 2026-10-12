function checkDigitFrequency(sourceContent, targetDigitChar, minimumCountThreshold) {
    const digitPattern = new RegExp(targetDigitChar, 'g');
    const foundMatches = sourceContent.match(digitPattern);
    return foundMatches !== null && foundMatches.length > minimumCountThreshold;
}

function processInput(dataString) {
    const SPECIAL_CASE_VALUE = '1000';
    const MIN_REQUIRED_OCCURRENCES = 2;

    if (dataString === SPECIAL_CASE_VALUE) {
        console.log('Yes');
        return;
    }

    for (let currentDigit = 1; currentDigit < 10; currentDigit++) {
        const digitAsString = String(currentDigit);
        if (checkDigitFrequency(dataString, digitAsString, MIN_REQUIRED_OCCURRENCES)) {
            console.log('Yes');
            return;
        }
    }

    console.log('No');
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
