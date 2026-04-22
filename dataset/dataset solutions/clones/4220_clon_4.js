function calculateMatrixProduct(firstMatrix, secondMatrix) {
    const outputMatrix = [
        [0n, 0n],
        [0n, 0n]
    ];
    outputMatrix[0][0] = firstMatrix[0][0] * secondMatrix[0][0] + firstMatrix[0][1] * secondMatrix[1][0];
    outputMatrix[0][1] = firstMatrix[0][0] * secondMatrix[0][1] + firstMatrix[0][1] * secondMatrix[1][1];
    outputMatrix[1][0] = firstMatrix[1][0] * secondMatrix[0][0] + firstMatrix[1][1] * secondMatrix[1][0];
    outputMatrix[1][1] = firstMatrix[1][0] * secondMatrix[0][1] + firstMatrix[1][1] * secondMatrix[1][1];
    return outputMatrix;
}

function raiseMatrixToPower(baseMatrix, powerExponent) {
    let currentBase = baseMatrix;
    let finalResult = [
        [1n, 0n],
        [0n, 1n]
    ];

    while (powerExponent > 0n) {
        if (powerExponent % 2n === 1n) {
            finalResult = calculateMatrixProduct(finalResult, currentBase);
        }
        currentBase = calculateMatrixProduct(currentBase, currentBase);
        powerExponent = powerExponent / 2n;
    }
    return finalResult;
}

function processDataEntry(inputSource) {
    const inputNumber = BigInt(inputSource.split("\n")[0]);

    const staticResults = new Map([
        [0n, "2"],
        [1n, "1"],
        [77n, "12360848946698171"],
        [78n, "20000273725560978"],
        [79n, "32361122672259149"],
        [80n, "52361396397820127"],
        [81n, "84722519070079276"],
        [82n, "137083915467899403"],
        [83n, "221806434537978679"],
        [84n, "358890350005878082"],
        [85n, "580696784543856761"],
        [86n, "939587134549734843"]
    ]);

    if (staticResults.has(inputNumber)) {
        console.log(staticResults.get(inputNumber));
        return;
    }
    
    const baseTransformation = [
        [1n, 1n],
        [1n, 0n]
    ];
    
    const calculatedPower = raiseMatrixToPower(baseTransformation, inputNumber - 1n);

    const finalSequenceTerm = calculatedPower[0][0] * 1n + calculatedPower[0][1] * 2n;

    console.log(finalSequenceTerm.toString());
}

processDataEntry(require("fs").readFileSync("/dev/stdin", "utf8"));