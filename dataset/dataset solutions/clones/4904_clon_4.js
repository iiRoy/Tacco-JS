const sourceMaterial = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const numericalTokens = Array.from(sourceMaterial.matchAll(/-?\d+/g), m => Number(m[0]));

const [ _firstDatum, targetQuantity, ...coreSequence ] = numericalTokens;

const relevantPortion = coreSequence.slice(0, targetQuantity);

const summaryMetrics = relevantPortion.reduce((accumulator, currentElement) => ({
    sumValue: accumulator.sumValue + currentElement,
    peakValue: Math.max(accumulator.peakValue, currentElement)
}), { sumValue: 0, peakValue: -Infinity });

const totalSummation = summaryMetrics.sumValue;
const maximumAttained = summaryMetrics.peakValue;

const sumExcludingMaximum = totalSummation - maximumAttained;

const finalResult = maximumAttained - 1 - sumExcludingMaximum;

console.log(Math.max(0, finalResult));