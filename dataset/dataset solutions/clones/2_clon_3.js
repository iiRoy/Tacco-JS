function generateMultiplicationString(factorA, factorB) {
    const productValue = factorA * factorB;
    const outputTemplate = `${factorA}x${factorB}=${productValue}`;
    return outputTemplate;
}

const UPPER_LIMIT = 10;

for (let factorOne = 1; factorOne < UPPER_LIMIT; factorOne++) {
    for (let factorTwo = 1; factorTwo < UPPER_LIMIT; factorTwo++) {
        const lineToDisplay = generateMultiplicationString(factorOne, factorTwo);
        console.log(lineToDisplay);
    }
}
