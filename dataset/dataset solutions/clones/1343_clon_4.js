function calculateExponentialModulo(baseElement, exponentValue, divisorValue) {
    if (exponentValue === 0n) {
        return 1n;
    }
    if (exponentValue === 1n) {
        return baseElement % divisorValue;
    }

    let subProblemResult = calculateExponentialModulo(baseElement, exponentValue / 2n, divisorValue);
    let intermediateProduct = (subProblemResult * subProblemResult) % divisorValue;

    if (exponentValue % 2n === 1n) {
        return (intermediateProduct * baseElement) % divisorValue;
    } else {
        return intermediateProduct;
    }
}

function processInputAndGenerateOutput(sourceText) {
    const numberPattern = /^(\d+)\s(\d+)/;
    const matches = sourceText.match(numberPattern);

    if (!matches || matches.length < 3) {
        throw new Error("Input data format is incorrect.");
    }

    const firstQuantity = BigInt(matches[1]);
    const secondQuantity = BigInt(matches[2]);

    const fixedDivisor = 1000000007n;

    const finalComputation = calculateExponentialModulo(firstQuantity, secondQuantity, fixedDivisor);
    console.log(finalComputation.toString());
}

processInputAndGenerateOutput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));