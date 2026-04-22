const acquisitionBuffer = [];
process.stdin.on('readable', () => {
    let segment;
    while ((segment = process.stdin.read()) !== null) {
        acquisitionBuffer.push(segment);
    }
});

process.stdin.on('end', () => {
    const rawData = Buffer.concat(acquisitionBuffer).toString('utf8').trim();
    const dataSegments = rawData.split('\n');

    const convertStringsToNumbers = (str) => {
        const parts = str.split(' ');
        const numericValues = [];
        for (let i = 0; i < parts.length; i++) {
            numericValues.push(Number(parts[i]));
        }
        return numericValues;
    };

    const costFactors = convertStringsToNumbers(dataSegments[0]);
    const requiredAmount = Number(dataSegments[1]);

    const costFactorA = costFactors[0];
    const costFactorB = costFactors[1];
    const costFactorC = costFactors[2];
    const costFactorD = costFactors[3];

    let finalCalculationResult;

    const findSmallestValue = (...values) => {
        let currentSmallest = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] < currentSmallest) {
                currentSmallest = values[i];
            }
        }
        return currentSmallest;
    };

    const determineOptimalPrice = (volumeRequirement, ca, cb, cc, cd) => {
        if (volumeRequirement === 0) {
            return 0;
        }

        const pricePerLiterFromA = ca * 4;
        const pricePerLiterFromB = cb * 2;
        const pricePerLiterFromC = cc;
        const minimumPricePerLiter = findSmallestValue(pricePerLiterFromA, pricePerLiterFromB, pricePerLiterFromC);

        const twoLiterDirectPrice = cd;

        return (minimumPricePerLiter * 2 < twoLiterDirectPrice)
            ? (volumeRequirement * minimumPricePerLiter)
            : (Math.trunc(volumeRequirement / 2) * twoLiterDirectPrice + minimumPricePerLiter);
    };

    finalCalculationResult = determineOptimalPrice(requiredAmount, costFactorA, costFactorB, costFactorC, costFactorD);

    process.stdout.write(finalCalculationResult.toString() + '\n');
});

process.stdin.resume();