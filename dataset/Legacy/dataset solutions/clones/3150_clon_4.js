const processInputData = rawData => {
    const numericValues = rawData.split(' ').reduce((accumulator, currentString) => {
        accumulator.push(parseFloat(currentString));
        return accumulator;
    }, []);

    const firstVal = numericValues[0];
    const secondVal = numericValues[1];
    const thirdVal = numericValues[2];

    const ratioCalculator = new Map();
    ratioCalculator.set(true, () => 0);
    ratioCalculator.set(false, (numerator, denominator) => numerator / denominator);

    const computedRatio = ratioCalculator.get(firstVal > secondVal)(secondVal, firstVal);

    const resultSelector = new Map();
    resultSelector.set(true, (valA, valB) => valB);
    resultSelector.set(false, (valA, valB) => Math.trunc(valA));

    console.log(resultSelector.get(computedRatio >= thirdVal)(computedRatio, thirdVal));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
