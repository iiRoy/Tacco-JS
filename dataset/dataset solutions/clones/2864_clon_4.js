const primeModulus = 1000000007;

const multiplyMatrix = (matA, matB) => {
    const res = Array.from({ length: 2 }, () => Array(2).fill(0));
    res[0][0] = (matA[0][0] * matB[0][0] + matA[0][1] * matB[1][0]) % primeModulus;
    res[0][1] = (matA[0][0] * matB[0][1] + matA[0][1] * matB[1][1]) % primeModulus;
    res[1][0] = (matA[1][0] * matB[0][0] + matA[1][1] * matB[1][0]) % primeModulus;
    res[1][1] = (matA[1][0] * matB[0][1] + matA[1][1] * matB[1][1]) % primeModulus;
    return res;
};

const raiseMatrixToPower = (mat, exp) => {
    let result = [
        [1, 0],
        [0, 1]
    ];
    let base = mat;

    while (exp > 0) {
        if (exp % 2 === 1) {
            result = multiplyMatrix(result, base);
        }
        base = multiplyMatrix(base, base);
        exp = Math.floor(exp / 2);
    }
    return result;
};

const obtainFibonacciTerm = (termIndex) => {
    if (termIndex === 0) return 0;
    if (termIndex === 1) return 1;

    const fibBaseMatrix = [
        [1, 1],
        [1, 0]
    ];
    // For a matrix M = [[1,1],[1,0]], M^k = [[F_{k+1}, F_k], [F_k, F_{k-1}]]
    // So F_k is at M^k[1][0]
    const finalMatrix = raiseMatrixToPower(fibBaseMatrix, termIndex);
    return finalMatrix[1][0];
};

const retrieveSpecialSeriesElement = (pos) => {
    if (pos === 0) {
        return 1;
    }
    // For pos >= 1, it corresponds to the standard Fibonacci sequence F_pos (F_0=0, F_1=1, F_2=1, ...)
    return obtainFibonacciTerm(pos);
};

const processInput = (sourceText) => {
    const rawLines = sourceText.split('\n');
    const [totalLength, blockedCount] = rawLines.shift().split(' ').map(Number);

    const blockedPositions = Array.from({ length: blockedCount }, () => Number(rawLines.shift()));

    if (blockedCount > 1 && blockedPositions.slice(1).some((currentPos, index) => currentPos - blockedPositions[index] === 1)) {
        console.log(0);
        return;
    }

    const extendedPositions = [-1, ...blockedPositions, totalLength + 1];

    const segmentLengths = extendedPositions.slice(1).map((currentVal, index) => currentVal - extendedPositions[index] - 1);

    const finalProduct = segmentLengths.reduce((accumulator, length) => (accumulator * retrieveSpecialSeriesElement(length)) % primeModulus, 1);

    console.log(finalProduct);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));