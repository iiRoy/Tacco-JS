function calculateSpecialPairs(upperBound, limitValue) {
    let totalAccumulatedCount = 0;

    for (let currentM = 4; currentM <= upperBound; currentM++) {
        const currentMContribution = Array.from({ length: 8 }, (_, index) => index + 2)
            .filter(candidateDivisor => candidateDivisor * candidateDivisor <= currentM)
            .reduce((accumulator, currentDivisor) => {
                if (currentM % currentDivisor === 0) {
                    const complementaryDivisor = currentM / currentDivisor;

                    if (complementaryDivisor < 10) {
                        const firstArrangement = currentDivisor * 10 + complementaryDivisor;

                        if (firstArrangement <= limitValue) {
                            accumulator++;
                        }

                        if (currentDivisor !== complementaryDivisor) {
                            const secondArrangement = complementaryDivisor * 10 + currentDivisor;
                            if (secondArrangement <= limitValue) {
                                accumulator++;
                            }
                        }
                    }
                }
                return accumulator;
            }, 0);

        totalAccumulatedCount += currentMContribution;
    }

    return totalAccumulatedCount;
}

function processInputAndDisplay(rawInputString) {
    const parsedValues = rawInputString.split(" ");
    const firstNumericValue = parseInt(parsedValues[0], 10);
    const secondNumericValue = parseInt(parsedValues[1], 10);

    console.log('%d', calculateSpecialPairs(firstNumericValue, secondNumericValue));
}

processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
