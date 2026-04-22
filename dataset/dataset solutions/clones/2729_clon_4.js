function processInputString(rawTextContent) {
    let splitPoint = -1;
    for (let currentIdx = 0; currentIdx < rawTextContent.length; currentIdx++) {
        if (rawTextContent[currentIdx] === ' ') {
            splitPoint = currentIdx;
            break;
        }
    }

    const firstSegment = rawTextContent.substring(0, splitPoint);
    const secondSegment = rawTextContent.substring(splitPoint + 1);

    const numericA = parseInt(firstSegment, 10);
    const numericB = parseInt(secondSegment, 10);

    return [numericA, numericB];
}

function determineUpperQuotient(dividend, divisor) {
    if (isNaN(dividend) || isNaN(divisor)) {
        return NaN;
    }
    if (dividend === 0) return 0;

    if (divisor === 0) {
        if (dividend > 0) return Infinity;
        if (dividend < 0) return -Infinity;
        return NaN;
    }

    if (divisor < 0) {
        return determineUpperQuotient(-dividend, -divisor);
    }

    // At this point, divisor is guaranteed to be positive.
    if (dividend > 0) {
        if (dividend <= divisor) {
            return 1;
        } else {
            return 1 + determineUpperQuotient(dividend - divisor, divisor);
        }
    } else { // dividend is negative
        return determineUpperQuotient(dividend + divisor, divisor) - 1;
    }
}

function executeCalculation(sourceData) {
    const cleansedData = sourceData.trim();
    const numericalComponents = processInputString(cleansedData);

    const firstComponent = numericalComponents[0];
    const secondComponent = numericalComponents[1];

    const finalQuotient = determineUpperQuotient(firstComponent, secondComponent + 1);

    console.log(finalQuotient);
}

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));