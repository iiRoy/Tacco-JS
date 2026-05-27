const composeKey = (rowIdx, colIdx) => `${rowIdx}_${colIdx}`;

const computeValue = (initialRow, initialCol, finalRow, finalCol) => {
    const valueCache = new Map(); // Stores BigInt results for (currentR, currentC)

    for (let currentR = initialRow; currentR <= finalRow; currentR++) {
        for (let currentC = initialCol; currentC <= finalCol; currentC++) {
            let calculatedVal;
            const currentEntryKey = composeKey(currentR, currentC);

            if (currentR === initialRow) {
                // Base case: current row matches the initial row (a === c in original)
                // Formula: a ** (d - b)
                // Here, initialRow is 'a', currentC is 'd', initialCol is 'b'
                calculatedVal = initialRow ** (currentC - initialCol);
            } else if (currentC === initialCol) {
                // Base case: current column matches the initial column (b === d in original)
                // Formula: b ** (c - a)
                // Here, initialCol is 'b', currentR is 'c', initialRow is 'a'
                calculatedVal = initialCol ** (currentR - initialRow);
            } else {
                // Recurrence relation:
                // F(c, d) = F(c-1, d) * d + F(c, d-1) * c - F(c-1, d-1) * (c-1) * (d-1)
                // Using currentR for 'c' and currentC for 'd'
                const valFromPrevR = valueCache.get(composeKey(currentR - 1n, currentC));
                const valFromPrevC = valueCache.get(composeKey(currentR, currentC - 1n));
                const valFromBothPrev = valueCache.get(composeKey(currentR - 1n, currentC - 1n));

                calculatedVal = (valFromPrevR * currentC) +
                                (valFromPrevC * currentR) -
                                (valFromBothPrev * (currentR - 1n) * (currentC - 1n));
            }
            valueCache.set(currentEntryKey, calculatedVal);
        }
    }
    return valueCache.get(composeKey(finalRow, finalCol));
};

const processInput = (inputData) => {
    const lines = inputData.split("\n");
    const [valA, valB, valC, valD] = lines[0].split(" ").map(valStr => BigInt(valStr));
    const modulus = 998244353n;

    const finalResult = computeValue(valA, valB, valC, valD);
    console.log(Number(finalResult % modulus));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
