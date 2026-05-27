function verifyAllDigitsPresent(textToCheck, requiredSet) {
    for (let i = 0; i < requiredSet.length; i++) {
        const currentDigit = requiredSet[i];
        if (textToCheck.indexOf(currentDigit) === -1) {
            return false;
        }
    }
    return true;
}

function processInputData(sourceContent) {
    const processedContent = sourceContent.trim();

    const requiredNumericCharacters = ['1', '9', '7', '4'];

    const positiveResponse = "YES";
    const negativeResponse = "NO";

    const allDigitsFound = verifyAllDigitsPresent(processedContent, requiredNumericCharacters);

    if (allDigitsFound) {
        console.log(positiveResponse);
    } else {
        console.log(negativeResponse);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
