const MOD_VAL = 998244353n;

const calculateGridValue = (startR, startC, endR, endC) => {
    const rowDimension = Number(endR - startR) + 1;
    const colDimension = Number(endC - startC) + 1;

    const dpTable = Array.from({ length: rowDimension }, () => Array(colDimension).fill(0n));

    for (let rIndex = 0; rIndex < rowDimension; rIndex++) {
        for (let cIndex = 0; cIndex < colDimension; cIndex++) {
            const currentRCoord = startR + BigInt(rIndex);
            const currentCCoord = startC + BigInt(cIndex);

            if (currentRCoord === startR) {
                dpTable[rIndex][cIndex] = (startR ** (currentCCoord - startC)) % MOD_VAL;
            } else if (currentCCoord === startC) {
                dpTable[rIndex][cIndex] = (startC ** (currentRCoord - startR)) % MOD_VAL;
            } else {
                const termOne = (dpTable[rIndex - 1][cIndex] * currentCCoord) % MOD_VAL;
                const termTwo = (dpTable[rIndex][cIndex - 1] * currentRCoord) % MOD_VAL;
                const termThree = (dpTable[rIndex - 1][cIndex - 1] * (currentRCoord - 1n) * (currentCCoord - 1n)) % MOD_VAL;

                let intermediateResult = (termOne + termTwo - termThree);
                dpTable[rIndex][cIndex] = (intermediateResult % MOD_VAL + MOD_VAL) % MOD_VAL;
            }
        }
    }

    return dpTable[rowDimension - 1][colDimension - 1];
};

const processInputData = (inputString) => {
    const inputLines = inputString.split("\n");
    const [valA, valB, valC, valD] = inputLines[0].split(" ").map(str => BigInt(str));

    const finalResult = calculateGridValue(valA, valB, valC, valD);

    console.log(Number(finalResult));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
