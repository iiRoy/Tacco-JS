const computeTotalValidPairs = (maxVal, limitValue) => {
    if (maxVal < 4) return 0;

    const possibleProducts = Array.from({ length: maxVal - 3 }, (_, idx) => idx + 4);

    const totalCount = possibleProducts.reduce((acc, currentProd) => {
        const singleDigitFactors = Array.from({ length: 8 }, (_, idx) => idx + 2);

        const currentProdContributions = singleDigitFactors.reduce((innerAcc, firstDigit) => {
            if (currentProd % firstDigit === 0) {
                const secondDigit = currentProd / firstDigit;
                if (secondDigit < 10) {
                    const numRepresentationA = firstDigit * 10 + secondDigit;
                    
                    if (numRepresentationA <= limitValue) {
                        innerAcc++;
                        if (firstDigit !== secondDigit) {
                            const numRepresentationB = secondDigit * 10 + firstDigit;
                            if (numRepresentationB <= limitValue) {
                                innerAcc++;
                            }
                        }
                    }
                }
            }
            return innerAcc;
        }, 0);

        return acc + currentProdContributions;
    }, 0);

    return totalCount;
};

const processInputAndDisplay = (textualData) => {
    const numericParts = textualData.split(" ");
    const highRange = Number.parseInt(numericParts[0], 10);
    const limitValue = Number.parseInt(numericParts[1], 10);

    const finalResult = computeTotalValidPairs(highRange, limitValue);
    console.log(finalResult);
};

// This line must remain unchanged for standard input/output handling.
processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));