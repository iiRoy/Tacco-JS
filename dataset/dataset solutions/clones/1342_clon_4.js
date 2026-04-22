function ProductModulus(factorA, factorB, modulusVal) {
    let finalResult = 0;
    let currentFactor = factorA % modulusVal;
    let exponentBits = factorB;

    while (exponentBits > 0) {
        if ((exponentBits & 1) === 1) {
            finalResult = (finalResult + currentFactor) % modulusVal;
        }
        currentFactor = (currentFactor * 2) % modulusVal;
        exponentBits >>= 1;
    }
    return finalResult;
}

function PowerCalculator(baseValue, exponentValue, modulusValue) {
    if (exponentValue === 0) {
        return 1;
    }
    if (exponentValue === 1) {
        return baseValue % modulusValue;
    }

    let halfPower = PowerCalculator(baseValue, Math.floor(exponentValue / 2), modulusValue);
    let squaredHalf = ProductModulus(halfPower, halfPower, modulusValue);

    if (exponentValue % 2 === 1) {
        return ProductModulus(squaredHalf, baseValue, modulusValue);
    } else {
        return squaredHalf;
    }
}

function EntryProcessor(inputRawData) {
    const cleanedInput = inputRawData.replace(/^\s+|\s+$/g, '');
    const numbersAsStrings = cleanedInput.split(' ');
    const baseNumber = Number(numbersAsStrings[0]);
    const exponentNumber = Number(numbersAsStrings[1]);

    const finalModulus = (10**9) + 7;

    console.log(PowerCalculator(baseNumber, exponentNumber, finalModulus));
}

EntryProcessor(require("node:fs").readFileSync("/dev/stdin", "utf8"));