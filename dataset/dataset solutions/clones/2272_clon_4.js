const processNumericalSeries = (incomingData) => {
    const modulusConstant = 10000000007;

    const textSegments = incomingData.split('\n');
    const quantityIndicator = Number(textSegments[0]);
    const numericalValues = textSegments[1].split(' ').map(str => parseInt(str, 10));

    console.log(numericalValues);

    const valuesToAccumulate = numericalValues.slice(1);

    let runningAccumulator = 0;
    const progressiveSums = valuesToAccumulate.map(val => {
        runningAccumulator += val;
        return runningAccumulator;
    });

    progressiveSums.forEach(sumEntry => console.log(sumEntry));

    const finalAccumulatedSum = progressiveSums.length > 0 ? progressiveSums[progressiveSums.length - 1] : 0;

    const rangeForProduct = Array.from({ length: quantityIndicator - 1 }, (_, idx) => idx + 1);
    const cumulativeProduct = rangeForProduct.reduce((product, num) => product * num, 1);

    let derivedCalculation;
    if (quantityIndicator === 1) {
        derivedCalculation = NaN;
    } else {
        derivedCalculation = (finalAccumulatedSum / (quantityIndicator - 1)) * cumulativeProduct;
    }

    console.log(derivedCalculation);
    console.log(derivedCalculation % modulusConstant);
};

const fileSystem = require('fs');
const filePath = '/dev/stdin';
const rawInputContent = fileSystem.readFileSync(filePath, 'utf8');

processNumericalSeries(rawInputContent);