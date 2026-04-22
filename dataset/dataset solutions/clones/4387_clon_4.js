const sourceAcquirer = require('node:fs');
const inputContent = sourceAcquirer.readFileSync(0, 'utf8');

const contentBreakdown = inputContent.trim().split('\n');
const totalQuantity = Number(contentBreakdown[0]);
const numericalSequence = contentBreakdown[1].split(' ').map(Number);

const processingOutcome = numericalSequence.reduce((accumulatorObject, currentItem, itemIndex) => {
    const anticipatedValue = itemIndex + 1;
    const isCurrentMatch = currentItem === anticipatedValue;

    if (isCurrentMatch) {
        if (accumulatorObject.previousMatchConsidered) {
            return { currentTotal: accumulatorObject.currentTotal, previousMatchConsidered: false };
        } else {
            return { currentTotal: accumulatorObject.currentTotal + 1, previousMatchConsidered: true };
        }
    } else {
        return { currentTotal: accumulatorObject.currentTotal, previousMatchConsidered: false };
    }
}, { currentTotal: 0, previousMatchConsidered: false });

console.log(processingOutcome.currentTotal);