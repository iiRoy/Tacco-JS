const contentSource = require('node:fs').readFileSync(0, 'utf8');

const allRelevantLines = contentSource.split('\n').filter(eachLine => eachLine.trim().length > 0);

const numericalCount = Number(allRelevantLines[0]);
const dataEntryStrings = allRelevantLines.slice(1);

console.log(numericalCount);

const computedOutcomes = dataEntryStrings.map(currentEntryString => {
    const componentValues = currentEntryString.split(' ').map(Number);

    const primaryOperand = componentValues[0] - 1;
    const secondaryOperand = componentValues[1] - 1;
    const tertiaryOperand = componentValues[2];

    const specificModifier = (primaryOperand % 3 !== 2) ? Math.floor(secondaryOperand / 2) : 0;

    const finalCalculation = 196471 -
                             primaryOperand * 195 -
                             Math.floor(primaryOperand / 3) * 5 -
                             secondaryOperand * 20 +
                             specificModifier -
                             tertiaryOperand;
    return finalCalculation;
});

computedOutcomes.forEach(resultValue => console.log(resultValue));