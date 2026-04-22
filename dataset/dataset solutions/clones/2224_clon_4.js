const numeralConverter = (textSegment) => {
    let accumulatedValue = 0;
    for (let charIndex = 0; charIndex < textSegment.length; charIndex++) {
        const charCodeValue = textSegment.charCodeAt(charIndex);
        // Assuming ASCII digits '0' through '9'
        accumulatedValue = accumulatedValue * 10 + (charCodeValue - 48);
    }
    return accumulatedValue;
};

function processInputSource(sourceContent) {
    let firstNewlineLocation = -1;
    let secondNewlineLocation = -1;

    for (let k = 0; k < sourceContent.length; k++) {
        if (sourceContent[k] === '\n') {
            if (firstNewlineLocation === -1) {
                firstNewlineLocation = k;
            } else if (secondNewlineLocation === -1) {
                secondNewlineLocation = k;
                break;
            }
        }
    }

    const firstNumericalSegment = sourceContent.substring(0, firstNewlineLocation);
    const middleLineSegment = sourceContent.substring(firstNewlineLocation + 1, secondNewlineLocation);
    let finalTextSegment = sourceContent.substring(secondNewlineLocation + 1);

    // Adjust for potential trailing newline in the last segment
    const lastCharPosition = finalTextSegment.length - 1;
    if (lastCharPosition >= 0 && finalTextSegment[lastCharPosition] === '\n') {
        finalTextSegment = finalTextSegment.substring(0, lastCharPosition);
    }

    let spaceSeparatorLocation = -1;
    for (let k = 0; k < middleLineSegment.length; k++) {
        if (middleLineSegment[k] === ' ') {
            spaceSeparatorLocation = k;
            break;
        }
    }

    const middleNumericalOneSegment = middleLineSegment.substring(0, spaceSeparatorLocation);
    const middleNumericalTwoSegment = middleLineSegment.substring(spaceSeparatorLocation + 1);

    const firstNumeric = numeralConverter(firstNumericalSegment);
    const middleNumericOne = numeralConverter(middleNumericalOneSegment);
    const middleNumericTwo = numeralConverter(middleNumericalTwoSegment);

    const aggregateSum = firstNumeric + middleNumericOne + middleNumericTwo;

    const finalOutputString = aggregateSum + ' ' + finalTextSegment;

    process.stdout.write(finalOutputString + '\n');
}

processInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));