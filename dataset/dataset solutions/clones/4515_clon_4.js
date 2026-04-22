const REMAINDER_BASE_VALUE = 1000000007;

const generateModularFactorial = (upperLimit, modulus) => {
    if (upperLimit < 0) return 0;
    if (upperLimit <= 1) return 1;
    
    return Array.from({ length: upperLimit }, (_, index) => index + 1)
                .reduce((accum, current) => (accum * current) % modulus, 1);
};

const executeCalculation = (dataPayload) => {
    const [initialLine] = dataPayload.split("\n");
    const [firstNumericStr, secondNumericStr] = initialLine.split(" ");
    
    const firstNumeric = Number(firstNumericStr);
    const secondNumeric = Number(secondNumericStr);

    const absoluteDifference = Math.abs(firstNumeric - secondNumeric);

    const multiplierLookup = new Map([
        [0, 2],
        [1, 1]
    ]);
    
    const finalMultiplier = multiplierLookup.get(absoluteDifference) || 0;

    if (finalMultiplier === 0) {
        console.log(0);
        return;
    }

    const factA = generateModularFactorial(firstNumeric, REMAINDER_BASE_VALUE);
    const factB = generateModularFactorial(secondNumeric, REMAINDER_BASE_VALUE);

    const intermediateProduct = (factA * factB) % REMAINDER_BASE_VALUE;
    const finalComputedValue = (intermediateProduct * finalMultiplier) % REMAINDER_BASE_VALUE;

    console.log(finalComputedValue);
};

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));