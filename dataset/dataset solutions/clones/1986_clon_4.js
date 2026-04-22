const processExternalData = (inputContent) => {
    const contentLines = inputContent.split("\n");
    const calculationBoundary = Number(contentLines[0]);

    const findGreatestCommonDivisor = (firstNum, secondNum, thirdNum) => {
        for (let divisorCandidate = 200; divisorCandidate >= 1; divisorCandidate--) {
            if (firstNum % divisorCandidate === 0 && secondNum % divisorCandidate === 0 && thirdNum % divisorCandidate === 0) {
                return divisorCandidate;
            }
        }
        return 1; // Should not be reached for positive integers as 1 is always a common divisor.
    };

    const divisorCache = new Map();
    const retrieveDivisorFromCache = (valA, valB, valC) => {
        const cacheKeyString = `${valA}.${valB}.${valC}`;
        if (divisorCache.has(cacheKeyString)) {
            return divisorCache.get(cacheKeyString);
        }
        const computedDivisor = findGreatestCommonDivisor(valA, valB, valC);
        divisorCache.set(cacheKeyString, computedDivisor);
        return computedDivisor;
    };

    const numberRange = Array.from({ length: calculationBoundary }, (_, i) => i + 1);

    const cumulativeSum = numberRange.flatMap(numA =>
        numberRange.flatMap(numB =>
            numberRange.map(numC => retrieveDivisorFromCache(numA, numB, numC))
        )
    ).reduce((accumulator, currentGcd) => accumulator + currentGcd, 0);

    console.log(cumulativeSum);
};

processExternalData(require("fs").readFileSync("/dev/stdin", "utf8"));