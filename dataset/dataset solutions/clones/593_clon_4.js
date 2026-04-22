const dataContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = dataContent.trim().split('\n').filter(Boolean);

const [dimensionSpecifier, ...valueEntries] = processedLines;
const [nodeCount, operationCount] = dimensionSpecifier.split(' ').map(Number);

const connectionCosts = valueEntries.slice(0, nodeCount - 1).map(Number);
const movementInstructions = valueEntries.slice(nodeCount - 1).map(Number);

const initialNodeIndex = 0;
const modulusValue = 100000;

const finalResult = movementInstructions.reduce((currentAggregate, singleInstruction) => {
    let { positionIdentifier, cumulativeSum } = currentAggregate;
    const directionModifier = Math.sign(singleInstruction);
    const traversalMagnitude = Math.abs(singleInstruction);

    let segmentCostComponents = [];
    if (directionModifier === 1) {
        // Moving in positive direction: accumulate costs from current position up to (current + magnitude - 1)
        segmentCostComponents = connectionCosts.slice(positionIdentifier, positionIdentifier + traversalMagnitude);
    } else { // directionModifier === -1
        // Moving in negative direction: accumulate costs from (current - magnitude) up to (current - 1)
        segmentCostComponents = connectionCosts.slice(positionIdentifier - traversalMagnitude, positionIdentifier);
    }

    const instructionTotal = segmentCostComponents.reduce((acc, cost) => acc + cost, 0);
    cumulativeSum = (cumulativeSum + instructionTotal) % modulusValue;
    positionIdentifier += (directionModifier * traversalMagnitude);

    return { positionIdentifier, cumulativeSum };
}, { positionIdentifier: initialNodeIndex, cumulativeSum: 0 });

console.log(finalResult.cumulativeSum);