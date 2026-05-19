var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = sourceData.trim().split("\n");

var problemSets = [];
let lineIndex = 0;

while (true) {
    const currentN = Number(lineSegments[lineIndex++]);
    if (currentN === 0) {
        break;
    }
    const currentNumbersString = lineSegments[lineIndex++];
    const parsedNumbers = currentNumbersString.split(" ").map(Number);
    problemSets.push({
        count: currentN,
        values: parsedNumbers
    });
}

for (const dataSet of problemSets) {
    const sampleSize = dataSet.count;
    const numberSequence = dataSet.values;

    let totalSum = 0;
    for (const individualValue of numberSequence) {
        totalSum += individualValue;
    }

    const arithmeticMean = totalSum / sampleSize;

    const sumOfSquaredDeviations = numberSequence.map(element => {
        const deviation = element - arithmeticMean;
        return deviation * deviation;
    }).reduce((accumulator, squaredDiff) => accumulator + squaredDiff, 0);

    const standardDeviation = Math.sqrt(sumOfSquaredDeviations / sampleSize);

    console.log(standardDeviation.toFixed(8));
}
