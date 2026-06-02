const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allLines = fileContent.split('\n');

let lineIndex = 0;

while (true) {
    const currentNumberString = allLines[lineIndex++];
    const parsedNumber = Number(currentNumberString);

    if (parsedNumber === 0) {
        break;
    }

    const dataString = allLines[lineIndex++];
    const stringValues = dataString.split(' ');
    const numericalEntries = [];

    for (let i = 0; i < stringValues.length; i++) {
        numericalEntries.push(parseFloat(stringValues[i]));
    }

    let totalAccumulator = 0;
    for (let i = 0; i < numericalEntries.length; i++) {
        totalAccumulator += numericalEntries[i];
    }

    const entryCount = numericalEntries.length;
    const arithmeticMean = totalAccumulator / entryCount;

    let squaredDifferencesSum = 0;
    for (let i = 0; i < numericalEntries.length; i++) {
        const differenceFromMean = numericalEntries[i] - arithmeticMean;
        squaredDifferencesSum += (differenceFromMean * differenceFromMean);
    }

    const populationVariance = squaredDifferencesSum / entryCount;
    const finalStandardDeviation = Math.sqrt(populationVariance);

    console.log(finalStandardDeviation.toFixed(5));
}
