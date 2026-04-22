const performMatrixMultiplication = (matrixA, matrixB, modulus) => {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

    const resultMatrix = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

    for (let rA = 0; rA < rowsA; rA++) {
        for (let cB = 0; cB < colsB; cB++) {
            for (let i = 0; i < colsA; i++) {
                resultMatrix[rA][cB] = (resultMatrix[rA][cB] + (matrixA[rA][i] * matrixB[i][cB]) % modulus) % modulus;
            }
        }
    }
    return resultMatrix;
};

const raiseMatrixToPower = (baseMatrix, exponent, modulus) => {
    const dimension = baseMatrix.length;
    let outcome = Array(dimension).fill(0).map((_, i) => Array(dimension).fill(0).map((_, j) => (i === j ? 1 : 0))); // Identity matrix

    let currentBase = baseMatrix;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        if (currentExponent % 2 === 1) {
            outcome = performMatrixMultiplication(outcome, currentBase, modulus);
        }
        currentBase = performMatrixMultiplication(currentBase, currentBase, modulus);
        currentExponent = Math.floor(currentExponent / 2);
    }
    return outcome;
};

const obtainSequenceElement = (numericInput) => {
    const CONSTANT_MOD = (10 ** 9 + 7);
    const valueToCompute = Number(numericInput.trim());

    if (valueToCompute === 0) return 1;
    if (valueToCompute === 1) return 0;
    if (valueToCompute === 2) return 0;

    // For valueToCompute >= 3
    // Recurrence: P(n) = P(n-1) + P(n-3)
    // State vector: [P(n), P(n-1), P(n-2)]
    // Transition matrix T such that T * [P(k), P(k-1), P(k-2)]^T = [P(k+1), P(k), P(k-1)]^T
    const transformationMatrix = [
        [1, 0, 1], // P(k+1) = 1*P(k) + 0*P(k-1) + 1*P(k-2)
        [1, 0, 0], // P(k)   = 1*P(k) + 0*P(k-1) + 0*P(k-2)
        [0, 1, 0]  // P(k-1) = 0*P(k) + 1*P(k-1) + 0*P(k-2)
    ];

    // Initial vector for n=3: [P(3), P(2), P(1)]^T
    // P(3)=1, P(2)=0, P(1)=0
    const initialVector = [
        [1],
        [0],
        [0]
    ];

    // We need to compute T^(valueToCompute - 3)
    const exponentValue = valueToCompute - 3;
    const poweredMatrix = raiseMatrixToPower(transformationMatrix, exponentValue, CONSTANT_MOD);

    // Multiply the powered matrix by the initial vector
    const resultantVector = performMatrixMultiplication(poweredMatrix, initialVector, CONSTANT_MOD);

    // The desired value P(valueToCompute) is the first element of the resultant vector
    return resultantVector[0][0];
};

process.env.APPLICATION_MODE
  ? (process.env.APPLICATION_MODE === 'test' ? () => {} /* Placeholder for test logic */ : console.log(obtainSequenceElement(require('fs').readFileSync('dev/stdin', 'utf8'))))
  : console.log(obtainSequenceElement(require('fs').readFileSync('/dev/stdin', 'utf8')));