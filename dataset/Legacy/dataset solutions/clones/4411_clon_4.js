function myout(text) {
    console.log(text);
}

function calculateModularPower(baseValue, exponentValue, modulusValue) {
    let resultAccumulator = 1n;
    let currentBase = BigInt(baseValue);
    let currentExponent = BigInt(exponentValue);
    const currentModulus = BigInt(modulusValue);

    currentBase %= currentModulus;

    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) {
            resultAccumulator = (resultAccumulator * currentBase) % currentModulus;
        }
        currentBase = (currentBase * currentBase) % currentModulus;
        currentExponent /= 2n;
    }
    return Number(resultAccumulator);
}

function Main(programInput) {
    const parsedInputLines = programInput.trim().split("\n");
    const integerValue = parseInt(parsedInputLines[0], 10);

    const primeModulus = 1000000007;

    const factorThreeCount = Math.floor((integerValue + 2) / 3);
    const factorTwoCount = Math.floor((integerValue + 1) / 3);

    const powerOfThreeTerm = calculateModularPower(3, factorThreeCount, primeModulus);
    const powerOfTwoTerm = calculateModularPower(2, factorTwoCount, primeModulus);

    const finalComputedValue = (powerOfThreeTerm * powerOfTwoTerm) % primeModulus;

    myout(finalComputedValue);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
