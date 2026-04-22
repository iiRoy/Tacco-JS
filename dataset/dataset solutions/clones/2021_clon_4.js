const readStream = require('node:fs');

function determineValue(inputQuantity) {
    const numericalMeasure = Number(inputQuantity);
    const countOfFives = Math.trunc(numericalMeasure / 5);
    const accumulatedFromFives = countOfFives * 5;
    const extraForFiveHundreds = Math.trunc(numericalMeasure / 500) * 500;
    return accumulatedFromFives + extraForFiveHundreds;
}

const rawTextData = readStream.readFileSync(0, 'utf8');
const finalCalculatedFigure = determineValue(rawTextData);
console.log(finalCalculatedFigure);