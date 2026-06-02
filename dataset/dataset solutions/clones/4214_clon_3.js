function processInputData(sourceText) {
    const MIN_DIGIT_VAL = 1;
    const MAX_DIGIT_VAL_EXCLUSIVE = 10;

    const checkDigitFrequency = (targetString, digitValue) => {
        const digitPattern = new RegExp(String(digitValue), 'g');
        const foundOccurrences = targetString.match(digitPattern);

        if (!foundOccurrences) {
            return false;
        }
        return foundOccurrences.length > 2;
    };

    for (let currentDigit = MIN_DIGIT_VAL; currentDigit < MAX_DIGIT_VAL_EXCLUSIVE; currentDigit++) {
        if (checkDigitFrequency(sourceText, currentDigit)) {
            console.log('Yes');
            return;
        }
    }

    console.log('No');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
