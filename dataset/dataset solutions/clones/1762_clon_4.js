const MOD_CONST = 998244353n;

const obtainResult = (startA, startB, endC, endD) => {
    const valueStore = new Map(); // Stores Map<BigInt, Map<BigInt, BigInt>>

    const fetchRow = (rowKey) => {
        if (!valueStore.has(rowKey)) {
            valueStore.set(rowKey, new Map());
        }
        return valueStore.get(rowKey);
    };

    for (let currentC = startA; currentC <= endC; currentC++) {
        for (let currentD = startB; currentD <= endD; currentD++) {
            let calculatedVal;
            if (currentC === startA) {
                calculatedVal = (startA ** (currentD - startB)) % MOD_CONST;
            } else if (currentD === startB) {
                calculatedVal = (startB ** (currentC - startA)) % MOD_CONST;
            } else {
                const prevCRow = fetchRow(currentC - 1n);
                const currCRow = fetchRow(currentC);

                const term1 = (prevCRow.get(currentD) * currentD) % MOD_CONST;
                const term2 = (currCRow.get(currentD - 1n) * currentC) % MOD_CONST;
                const term3 = (prevCRow.get(currentD - 1n) * (currentC - 1n) * (currentD - 1n)) % MOD_CONST;
                
                calculatedVal = (term1 + term2 - term3);
                calculatedVal = (calculatedVal % MOD_CONST + MOD_CONST) % MOD_CONST;
            }
            fetchRow(currentC).set(currentD, calculatedVal);
        }
    }

    return fetchRow(endC).get(endD);
};

const processInputAndOutput = (rawInput) => {
    const lines = rawInput.split("\n");
    const [valA, valB, valC, valD] = lines[0].split(" ").map(entry => BigInt(entry));
    
    console.log(`${valA}:${valB}:${valC}:${valD}`);
    console.log(Number(obtainResult(valA, valB, valC, valD)));
};

processInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));