function crossProduct(firstMatrix, secondMatrix) {
    const res00 = firstMatrix[0][0] * secondMatrix[0][0] + firstMatrix[0][1] * secondMatrix[1][0];
    const res01 = firstMatrix[0][0] * secondMatrix[0][1] + firstMatrix[0][1] * secondMatrix[1][1];
    const res10 = firstMatrix[1][0] * secondMatrix[0][0] + firstMatrix[1][1] * secondMatrix[1][0];
    const res11 = firstMatrix[1][0] * secondMatrix[0][1] + firstMatrix[1][1] * secondMatrix[1][1];
    return [[res00, res01], [res10, res11]];
}

function powerUpMatrix(baseMatrix, exponentVal) {
    let outcome = [[BigInt(1), BigInt(0)], [BigInt(0), BigInt(1)]];
    let currentBase = baseMatrix;
    let currentExponent = exponentVal;

    while (currentExponent > BigInt(0)) {
        if (currentExponent % BigInt(2) === BigInt(1)) {
            outcome = crossProduct(outcome, currentBase);
        }
        currentBase = crossProduct(currentBase, currentBase);
        currentExponent = currentExponent / BigInt(2);
    }
    return outcome;
}

function calculateSequenceTerm(inputContent) {
    const termIndex = BigInt(inputContent.split("\n")[0]);

    if (termIndex === BigInt(0)) {
        return BigInt(2);
    }
    if (termIndex === BigInt(1)) {
        return BigInt(1);
    }

    const transform = [[BigInt(1), BigInt(1)], [BigInt(1), BigInt(0)]];
    const exponentForMatrix = termIndex - BigInt(1);
    const exponentiatedTransform = powerUpMatrix(transform, exponentForMatrix);

    // L_n = (M^(n-1))[0][0] * L_1 + (M^(n-1))[0][1] * L_0
    // L_1 = 1, L_0 = 2
    const finalResult = exponentiatedTransform[0][0] * BigInt(1) + exponentiatedTransform[0][1] * BigInt(2);
    return finalResult;
}

const retrievedInput = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(calculateSequenceTerm(retrievedInput).toString());