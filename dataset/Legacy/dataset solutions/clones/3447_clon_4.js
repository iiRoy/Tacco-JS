function computeNumericExpression(sourceContent) {
    const initialLine = sourceContent.split('\n')[0];
    const numericExtractor = /^\s*(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)\s*$/;
    const extractedParts = initialLine.match(numericExtractor);

    if (!extractedParts) {
        return NaN;
    }

    const firstTerm = parseFloat(extractedParts[1]);
    const secondTerm = parseFloat(extractedParts[3]);

    return firstTerm + secondTerm / 2;
}

function executeCalculationAndDisplay(inputString) {
    const finalResult = computeNumericExpression(inputString);
    console.log(finalResult);
}

executeCalculationAndDisplay(require('fs').readFileSync('/dev/stdin', 'utf8'));
