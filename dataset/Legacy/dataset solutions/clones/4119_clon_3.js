function logOutput(message) {
    console.log(message);
}

function processInput(rawDataString) {
    const processedLines = rawDataString.trim().split("\n");

    const firstLineParts = processedLines[0].split(" ");
    const firstNum = parseInt(firstLineParts[0], 10);
    const secondNum = parseInt(firstLineParts[1], 10);

    const targetString = processedLines[1];

    let isValidFormat = true;
    const expectedHyphenIndex = firstNum;

    for (let charIndex = 0; charIndex < targetString.length; charIndex++) {
        const currentCharacter = targetString[charIndex];

        const isAtHyphenPosition = (charIndex === expectedHyphenIndex);
        const isCharActuallyHyphen = (currentCharacter === '-');

        // Check for two invalid scenarios:
        // 1. A hyphen is expected at this position, but the character is not a hyphen.
        // 2. A hyphen is NOT expected at this position, but the character IS a hyphen.
        if ((isAtHyphenPosition && !isCharActuallyHyphen) ||
            (!isAtHyphenPosition && isCharActuallyHyphen)) {
            isValidFormat = false;
            break;
        }
    }

    if (isValidFormat) {
        logOutput("Yes");
    } else {
        logOutput("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
