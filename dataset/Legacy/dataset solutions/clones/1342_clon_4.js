function performInputProcessing(rawData) {
    const [firstLine] = rawData.trim().split("\n").map(lineSegment => lineSegment.split(" "));
    const [baseValue, exponentValue] = firstLine.map(Number);

    const MODULUS_CONSTANT = 1000000007;

    console.log(calculateModularPower(baseValue, exponentValue, MODULUS_CONSTANT));
}

function multiplyNumbersMod(operandA, operandB, modulusConstraint) {
    return Number((BigInt(operandA) * BigInt(operandB)) % BigInt(modulusConstraint));
}

function calculateModularPower(base, exponent, modulus) {
    base %= modulus;

    if (exponent === 0) {
        return 1;
    }
    if (exponent === 1) {
        return base;
    }

    const halfExponentResult = calculateModularPower(base, Math.floor(exponent / 2), modulus);
    const squaredHalfResult = multiplyNumbersMod(halfExponentResult, halfExponentResult, modulus);

    if (exponent % 2 === 0) {
        return squaredHalfResult;
    } else {
        return multiplyNumbersMod(base, squaredHalfResult, modulus);
    }
}

performInputProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
