function decomposePrimeFactors(numVal) {
    const factorMap = new Map();
    let currentNum = numVal;

    if (currentNum <= 1) {
        return factorMap;
    }

    // Handle factor 2 separately for efficiency and to simplify the main loop
    while (currentNum % 2 === 0) {
        factorMap.set(2, (factorMap.get(2) || 0) + 1);
        currentNum /= 2;
    }

    // Iterate odd divisors starting from 3
    for (let div = 3; div * div <= currentNum; div += 2) {
        while (currentNum % div === 0) {
            factorMap.set(div, (factorMap.get(div) || 0) + 1);
            currentNum /= div;
        }
    }

    // If currentNum is still greater than 1, it must be a prime factor itself
    if (currentNum > 1) {
        factorMap.set(currentNum, (factorMap.get(currentNum) || 0) + 1);
    }
    return factorMap;
}

function processInput(inputStr) {
    const limitVal = Number(inputStr);
    const moduloConst = 10**9 + 7;

    const cumulativePrimeCounts = Array.from({ length: limitVal }, (_, idx) => idx + 1)
        .reduce((accMap, currentNumber) => {
            const currentNumFactors = decomposePrimeFactors(currentNumber);
            for (const [prime, exponent] of currentNumFactors.entries()) {
                accMap.set(prime, (accMap.get(prime) || 0) + exponent);
            }
            return accMap;
        }, new Map());

    // Convert Map to a plain object for console.log to match original output format
    const outputFactors = {};
    for (const [prime, exponent] of cumulativePrimeCounts.entries()) {
        outputFactors[prime] = exponent;
    }
    console.log(outputFactors);

    // Calculate the final product using reduce
    const finalProduct = Array.from(cumulativePrimeCounts.values())
        .reduce((accumulator, exponent) => (accumulator * (exponent + 1)) % moduloConst, 1);

    console.log(finalProduct);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
