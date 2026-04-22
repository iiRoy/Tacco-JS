const dataReader = require('fs');
const fullContent = dataReader.readFileSync('/dev/stdin', 'utf8');

const allTextLines = fullContent.trim().split('\n');
const [initialConfigLine, ...subsequentLines] = allTextLines;

const [paramA, paramB, paramC] = initialConfigLine.split(' ').map(Number);
const effectiveA = paramA - 1;
const effectiveC = paramC;
const numB = paramB;

const initialNumericValues = subsequentLines.slice(0, numB).map(Number);
const filteredNumericValues = initialNumericValues.filter(val => val !== effectiveC);

const finalSortedCollection = [...filteredNumericValues, effectiveC];
finalSortedCollection.sort((left, right) => left - right);

const calculatedCosts = finalSortedCollection.flatMap((currentDatum, currentIdx, entireCollection) => {
    const costsForCurrentDatum = [];

    if (currentDatum <= effectiveC) {
        if (currentIdx !== 0) {
            const priorDatum = entireCollection[currentIdx - 1];
            const costVariantOne = (effectiveC - currentDatum) * 2 + (effectiveA - effectiveC + 1) + priorDatum;
            costsForCurrentDatum.push(costVariantOne);
        }
    }

    if (effectiveC <= currentDatum) {
        if (currentIdx !== entireCollection.length - 1) {
            const postDatum = entireCollection[currentIdx + 1];
            const costVariantTwo = (currentDatum - effectiveC) * 2 + effectiveC + (effectiveA - postDatum + 1);
            costsForCurrentDatum.push(costVariantTwo);
        }
    }
    return costsForCurrentDatum;
});

const overallMinimum = Math.min(...calculatedCosts);

console.log(overallMinimum * 100);