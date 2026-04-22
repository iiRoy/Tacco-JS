function matMult(matA, matB) {
    const res = Array(3).fill(0).map(() => Array(3).fill(0));
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            for (let k = 0; k < 3; k++) {
                res[r][c] += matA[r][k] * matB[k][c];
            }
        }
    }
    return res;
}

function matExp(baseMat, power) {
    let identityMat = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    let currentBase = baseMat;
    while (power > 0) {
        if (power % 2 === 1) {
            identityMat = matMult(identityMat, currentBase);
        }
        currentBase = matMult(currentBase, currentBase);
        power = Math.floor(power / 2);
    }
    return identityMat;
}

const transMat = [
    [1, 1, 1],
    [1, 0, 0],
    [0, 1, 0]
];

const baseVec = [2, 1, 1]; // Corresponds to f(2), f(1), f(0)

function calcSeriesTerm(targetIndex) {
    if (targetIndex === 0) return 1;
    if (targetIndex === 1) return 1;
    if (targetIndex === 2) return 2;

    const expMat = matExp(transMat, targetIndex - 2);

    let computedTerm = 0;
    for (let k = 0; k < 3; k++) {
        computedTerm += expMat[0][k] * baseVec[k];
    }
    return computedTerm;
}

function processRequest(targetIndex) {
    const termResult = calcSeriesTerm(targetIndex);
    return Math.ceil(termResult / 3650);
}

const ioHandler = require("fs");
const sourceData = ioHandler.readFileSync("/dev/stdin", "utf-8");
const lineSegments = sourceData.split("\n");

lineSegments.forEach(function(singleEntry) {
    const parsedNumber = +singleEntry;
    if (parsedNumber === 0) return;
    console.log(processRequest(parsedNumber));
});