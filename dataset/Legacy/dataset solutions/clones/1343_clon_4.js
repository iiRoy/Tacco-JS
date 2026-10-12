function computeModularExponentiation(baseOperand, powerOperand, divisorOperand) {
    if (powerOperand === 0n) {
        return 1n;
    }

    const intermediateResult = computeModularExponentiation(baseOperand, powerOperand / 2n, divisorOperand);
    let finalProduct = (intermediateResult * intermediateResult) % divisorOperand;

    if (powerOperand % 2n !== 0n) {
        finalProduct = (finalProduct * baseOperand) % divisorOperand;
    }
    return finalProduct;
}

function executeProgram(sourceData) {
    const numberExtractor = /(\d+)\s+(\d+)/;
    const extractedValues = sourceData.match(numberExtractor);

    const baseValue = BigInt(extractedValues[1]);
    const exponentValue = BigInt(extractedValues[2]);
    const fixedDivisor = 1000000007n;

    const calculatedOutcome = computeModularExponentiation(baseValue, exponentValue, fixedDivisor);
    console.log(calculatedOutcome.toString());
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
