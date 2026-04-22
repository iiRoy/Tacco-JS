const MOD_DIVISOR = 1000000007;

const fastPower = (base, exponent, modulus) => {
    let outcome = 1;
    base %= modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) outcome = (outcome * base) % modulus;
        base = (base * base) % modulus;
        exponent = Math.floor(exponent / 2);
    }
    return outcome;
};

const inverseElement = (value, modulus) => fastPower(value, modulus - 2, modulus);

const factorialModulo = (limit, modulus) => {
    let currentProd = 1;
    for (let currentNum = 2; currentNum <= limit; currentNum++) {
        currentProd = (currentProd * currentNum) % modulus;
    }
    return currentProd;
};

const combinationsModulo = (total, chosen, modulus) => {
    if (chosen < 0 || chosen > total) return 0;
    if (chosen === 0 || chosen === total) return 1;
    if (chosen > total / 2) chosen = total - chosen;

    const numeratorPart = factorialModulo(total, modulus);
    const denominatorPart1 = inverseElement(factorialModulo(chosen, modulus), modulus);
    const denominatorPart2 = inverseElement(factorialModulo(total - chosen, modulus), modulus);

    return (((numeratorPart * denominatorPart1) % modulus) * denominatorPart2) % modulus;
};

const extractNumbers = (textSource) => {
    const numericRegex = /\d+/g;
    const digits = [];
    let currentMatch;
    while ((currentMatch = numericRegex.exec(textSource)) !== null) {
        digits.push(Number(currentMatch[0]));
    }
    return digits;
};

const acquireText = () => {
    const rawBuffer = require('node:fs').readSync(0, 1024);
    return Buffer.from(rawBuffer).toString().trim();
};

((runner) => {
    const dataStream = runner();
    const parameters = extractNumbers(dataStream);

    const initialVal = parameters[0];
    const excludedVal1 = parameters[1];
    const excludedVal2 = parameters[2];

    let totalPossible = fastPower(2, initialVal, MOD_DIVISOR);

    totalPossible = (totalPossible - combinationsModulo(initialVal, 0, MOD_DIVISOR) + MOD_DIVISOR) % MOD_DIVISOR;
    totalPossible = (totalPossible - combinationsModulo(initialVal, excludedVal1, MOD_DIVISOR) + MOD_DIVISOR) % MOD_DIVISOR;
    totalPossible = (totalPossible - combinationsModulo(initialVal, excludedVal2, MOD_DIVISOR) + MOD_DIVISOR) % MOD_DIVISOR;

    console.log(totalPossible);
})(acquireText);