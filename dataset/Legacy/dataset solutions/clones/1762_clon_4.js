const MOD_VAL = 998244353n;

const calculateGridResult = (initialR, initialC, targetR, targetC) => {
    const rowDimension = Number(targetR - initialR) + 1;
    const colDimension = Number(targetC - initialC) + 1;

    const dpTable = Array.from({ length: rowDimension }, () => Array(colDimension).fill(0n));

    for (let rIdx = 0; rIdx < rowDimension; rIdx++) {
        for (let cIdx = 0; cIdx < colDimension; cIdx++) {
            const currentRValue = initialR + BigInt(rIdx);
            const currentCValue = initialC + BigInt(cIdx);

            let computedValue;
            if (currentRValue === initialR) {
                computedValue = (initialR ** (currentCValue - initialC)) % MOD_VAL;
            } else if (currentCValue === initialC) {
                computedValue = (initialC ** (currentRValue - initialR)) % MOD_VAL;
            } else {
                const termOne = dpTable[rIdx - 1][cIdx] * currentCValue;
                const termTwo = dpTable[rIdx][cIdx - 1] * currentRValue;
                const termThree = dpTable[rIdx - 1][cIdx - 1] * (currentRValue - 1n) * (currentCValue - 1n);
                
                let combinedSum = termOne + termTwo - termThree;
                computedValue = ((combinedSum % MOD_VAL) + MOD_VAL) % MOD_VAL;
            }
            dpTable[rIdx][cIdx] = computedValue;
        }
    }
    return dpTable[rowDimension - 1][colDimension - 1];
};

const processInputData = (inputContent) => {
    const inputLines = inputContent.split("\n");
    const [valA, valB, valC, valD] = inputLines[0].split(" ").map(numericString => BigInt(numericString));
    console.log(`${valA}:${valB}:${valC}:${valD}`);
    console.log(Number(calculateGridResult(valA, valB, valC, valD)));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
