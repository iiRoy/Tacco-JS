function processInputData(rawData) {
    const primeModulus = 1000000000 + 7;

    const parsedValues = rawData.split("\n")[0].split(" ");
    const firstVal = parseInt(parsedValues[0], 10);
    const secondVal = parseInt(parsedValues[1], 10);

    const calculateModFactorial = (limit, modulus) => {
        if (limit < 0) {
            return 0;
        }
        if (limit === 0) {
            return 1;
        }

        return Array.from({ length: limit }, (_, idx) => idx + 1)
                    .reduce((accumulator, currentNumber) => (accumulator * currentNumber) % modulus, 1);
    };

    const valueDifference = Math.abs(firstVal - secondVal);
    let finalProduct;

    switch (valueDifference) {
        case 0:
            const factA = calculateModFactorial(firstVal, primeModulus);
            const factB = calculateModFactorial(secondVal, primeModulus);
            finalProduct = (factA * factB) % primeModulus;
            finalProduct = (finalProduct * 2) % primeModulus;
            console.log(finalProduct);
            break;
        case 1:
            const factX = calculateModFactorial(firstVal, primeModulus);
            const factY = calculateModFactorial(secondVal, primeModulus);
            finalProduct = (factX * factY) % primeModulus;
            console.log(finalProduct);
            break;
        default:
            console.log(0);
            break;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
