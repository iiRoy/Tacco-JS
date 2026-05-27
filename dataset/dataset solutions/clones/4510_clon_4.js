const MOD_VAL = Math.pow(10, 9) + 7;

function computeProductMod(val) {
    if (val === 0) {
        return 0;
    }
    if (val === 1) {
        return 1;
    }
    return (val * computeProductMod(val - 1)) % MOD_VAL;
}

function processInputValues(dataString) {
    const [firstStr, secondStr] = dataString.split(" ");
    const firstNum = Number(firstStr);
    const secondNum = Number(secondStr);

    const diffAbs = Math.abs(firstNum - secondNum);

    const multiplierMap = new Map([
        [0, 2],
        [1, 1]
    ]);

    const finalMultiplier = multiplierMap.get(diffAbs) || 0;

    if (finalMultiplier === 0) {
        return 0;
    }

    const factA = computeProductMod(firstNum);
    const factB = computeProductMod(secondNum);

    return (factA * factB * finalMultiplier) % MOD_VAL;
}

console.log(processInputValues(require("fs").readFileSync("/dev/stdin", "utf8")));
