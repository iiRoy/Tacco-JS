const conversionFactor = 1688 / 243;

const systemFileAccess = require('fs');

const inputLocation = '/dev/stdin';

const rawTextContent = systemFileAccess.readFileSync(inputLocation, 'utf8');

const numericalEntryPoints = rawTextContent
    .split(/\s/)
    .filter(segment => segment.length > 0)
    .map(val => parseFloat(val));

numericalEntryPoints.forEach(currentDatum => {
    const finalCalculatedValue = currentDatum * conversionFactor;
    console.log(finalCalculatedValue.toFixed(8));
});