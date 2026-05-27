process.stdin.resume();
process.stdin.setEncoding('utf8');

const getPrimeFactorization = (numberToFactor) => {
    let primeFactorList = [];
    let tempNumber = numberToFactor;

    const limitDivisor = Math.floor(Math.sqrt(tempNumber));
    for (let currentDivisor = 2; currentDivisor <= limitDivisor; currentDivisor++) {
        let primeCount = 0;
        while (tempNumber % currentDivisor === 0) {
            tempNumber /= currentDivisor;
            primeCount++;
        }
        if (primeCount > 0) {
            primeFactorList.push({ basePrime: currentDivisor, exponentValue: primeCount });
        }
    }

    if (tempNumber > 1) {
        primeFactorList.push({ basePrime: tempNumber, exponentValue: 1 });
    }
    return primeFactorList;
};

const processInputData = (inputDataString) => {
    const inputParts = inputDataString.split(" ");
    const targetFactorN = Number(inputParts[0]);
    const inputProductP = Number(inputParts[1]);

    const factorsOfP = getPrimeFactorization(inputProductP);

    let calculatedResult = 1;

    const calculateNthRootProduct = (factorArray, N_val) => {
        let currentProduct = 1;
        for (let factorIndex = 0; factorIndex < factorArray.length; factorIndex++) {
            const currentFactor = factorArray[factorIndex];
            const base = currentFactor.basePrime;
            const exponent = currentFactor.exponentValue;

            const powerComponent = Math.floor(exponent / N_val);
            
            if (powerComponent > 0) {
                currentProduct *= Math.pow(base, powerComponent);
            }
        }
        return currentProduct;
    };

    calculatedResult = calculateNthRootProduct(factorsOfP, targetFactorN);

    console.log(calculatedResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
