function processValues(inputString) {
    const parts = inputString.split(' ');
    const valK = parseInt(parts[0]);
    const valA = parseInt(parts[1]);
    const valB = parseInt(parts[2]);

    const diffD = valB - valA;
    const diffE = valK - valA;

    const computeFinalValue = (eVal, dVal, aVal, kVal) => {
        if (eVal < 2 || dVal < 3) {
            return kVal + 1;
        }

        const parityFlag = eVal & 1;

        const multiplierForD = parityFlag ? ((eVal + 1) / 2) : (eVal / 2);
        const constantAdd = parityFlag ? 0 : 1;

        return aVal + multiplierForD * dVal + constantAdd;
    };

    const finalValue = computeFinalValue(diffE, diffD, valA, valK);
    console.log(finalValue);
}

processValues(require("fs").readFileSync("/dev/stdin", "utf8"));
