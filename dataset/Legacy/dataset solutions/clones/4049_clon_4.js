const processInputAndCalculate = (rawData) => {
    const numericValues = rawData.split('\n').map(parseFloat);

    const maxUnitsFor500 = numericValues[0];
    const maxUnitsFor100 = numericValues[1];
    const maxUnitsFor50 = numericValues[2];
    const targetTotalValue = numericValues[3];

    const possibleCountsFor500 = Array.from({
        length: Math.min(maxUnitsFor500, Math.floor(targetTotalValue / 500)) + 1
    }, (_, index) => index);

    const totalValidCombinations = possibleCountsFor500.reduce((accumulatorFor500, currentCount500) => {
        const remainingValueAfter500s = targetTotalValue - (currentCount500 * 500);

        if (remainingValueAfter500s < 0) {
            return accumulatorFor500;
        }

        const possibleCountsFor100 = Array.from({
            length: Math.min(maxUnitsFor100, Math.floor(remainingValueAfter500s / 100)) + 1
        }, (_, index) => index);

        return accumulatorFor500 + possibleCountsFor100.reduce((accumulatorFor100, currentCount100) => {
            const remainingValueAfter100s = remainingValueAfter500s - (currentCount100 * 100);

            if (remainingValueAfter100s < 0) {
                return accumulatorFor100;
            }

            const isPerfectlyDivisibleBy50 = (remainingValueAfter100s % 50 === 0);
            const requiredCountFor50 = remainingValueAfter100s / 50;
            const isWithinLimitFor50 = (requiredCountFor50 <= maxUnitsFor50);

            return accumulatorFor100 + (isPerfectlyDivisibleBy50 && isWithinLimitFor50 ? 1 : 0);
        }, 0);
    }, 0);

    return totalValidCombinations;
};

const entryPoint = (inputPath) => {
    const fileContent = require('fs').readFileSync(inputPath, 'utf8');
    const finalResult = processInputAndCalculate(fileContent);
    console.log(finalResult);
};

entryPoint('/dev/stdin');
