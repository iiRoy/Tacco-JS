function parseInputData(rawContent) {
    const contentLines = rawContent.split('\n');
    contentLines.shift();
    return contentLines.map(val => Number(val));
}

function checkDivisibilityRecursively(remainingNumbers) {
    if (remainingNumbers.length === 0) {
        return "APPROVED";
    }

    const currentVal = remainingNumbers[0];
    const restOfNumbers = remainingNumbers.slice(1);

    if (currentVal % 2 === 0) {
        if (currentVal % 3 !== 0 && currentVal % 5 !== 0) {
            return "DENIED";
        }
    }

    return checkDivisibilityRecursively(restOfNumbers);
}

function processApplication(sourceText) {
    const numericalSequence = parseInputData(sourceText);
    const finalDecision = checkDivisibilityRecursively(numericalSequence);
    console.log(finalDecision);
}

processApplication(require("fs").readFileSync("/dev/stdin", "utf8"));
