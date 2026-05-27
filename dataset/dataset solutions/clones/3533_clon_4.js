function processInput(rawInput) {
    const inputParts = rawInput.split(" ");
    const countN = parseInt(inputParts[0], 10);
    let targetM = parseInt(inputParts[1], 10);

    const MODULUS_VAL = 1000000007;

    // Modular exponentiation (a^b % m)
    const computePower = (baseVal, exponentVal) => {
        let resultVal = 1;
        baseVal %= MODULUS_VAL;
        while (exponentVal > 0) {
            if (exponentVal % 2 === 1) resultVal = (resultVal * baseVal) % MODULUS_VAL;
            baseVal = (baseVal * baseVal) % MODULUS_VAL;
            exponentVal = Math.floor(exponentVal / 2);
        }
        return resultVal;
    };

    // Modular multiplicative inverse using Fermat's Little Theorem (a^(m-2) % m)
    const findModularInverse = (numberVal) => computePower(numberVal, MODULUS_VAL - 2);

    // Calculates nCk modulo MODULUS_VAL
    const calculateCombinationsMod = (nVal, kVal) => {
        if (kVal < 0 || kVal > nVal) return 0;
        if (kVal === 0 || kVal === nVal) return 1;
        // Optimization: C(n, k) = C(n, n-k)
        if (kVal > nVal / 2) kVal = nVal - kVal;

        let numeratorProduct = 1;
        for (let i = 0; i < kVal; i++) {
            numeratorProduct = (numeratorProduct * ((nVal - i) % MODULUS_VAL)) % MODULUS_VAL;
        }

        let denominatorProduct = 1;
        for (let i = 1; i <= kVal; i++) {
            denominatorProduct = (denominatorProduct * i) % MODULUS_VAL;
        }

        return (numeratorProduct * findModularInverse(denominatorProduct)) % MODULUS_VAL;
    };

    const primeFactorExponents = new Map();
    let tempM = targetM;
    let currentDivisor = 2;

    // Prime factorization using trial division
    while (currentDivisor * currentDivisor <= tempM) {
        if (tempM % currentDivisor === 0) {
            let exponentCount = 0;
            while (tempM % currentDivisor === 0) {
                tempM /= currentDivisor;
                exponentCount++;
            }
            primeFactorExponents.set(currentDivisor, exponentCount);
        }
        currentDivisor++;
    }

    // If tempM is still greater than 1, it's a prime factor itself
    if (tempM > 1) {
        primeFactorExponents.set(tempM, (primeFactorExponents.get(tempM) || 0) + 1);
    }

    let finalAccumulatedResult = 1;

    // Apply stars and bars formula for each prime factor
    // C(val + N - 1, val)
    for (const [pFactor, pExponent] of primeFactorExponents.entries()) {
        const nForCombo = pExponent + countN - 1;
        const kForCombo = pExponent;
        const currentCombinationTerm = calculateCombinationsMod(nForCombo, kForCombo);
        finalAccumulatedResult = (finalAccumulatedResult * currentCombinationTerm) % MODULUS_VAL;
    }

    return finalAccumulatedResult;
}

((b,c,d)=>"undefined"!=typeof require?console.log(processInput(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return processInput(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
3 12
`);
