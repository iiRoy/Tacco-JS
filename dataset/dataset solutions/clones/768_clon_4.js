const rawPayload = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const decodeSource = (payloadString) => {
    const segments = payloadString.trim().split('\n');
    const [metadataSegment, numericValuesSegment] = segments;

    const [itemQuantityString, upperBoundString] = metadataSegment.split(' ');
    const itemQuantity = Number(itemQuantityString);
    const upperBound = Number(upperBoundString);

    const elementCosts = numericValuesSegment.split(' ').map(Number);

    return { itemQuantity, upperBound, elementCosts };
};

const calculateOptimalAggregate = (processedContent) => {
    const { itemQuantity, upperBound, elementCosts } = processedContent;

    const ultimateResult = elementCosts.reduce((previousBest, componentOneCost, componentOneIndex) => {
        return elementCosts.reduce((currentMaximumSum, componentTwoCost, componentTwoIndex) => {
            if (componentOneIndex < componentTwoIndex) {
                const cumulativeCharge = componentOneCost + componentTwoCost;
                if (cumulativeCharge <= upperBound && cumulativeCharge > currentMaximumSum) {
                    return cumulativeCharge;
                }
            }
            return currentMaximumSum;
        }, previousBest);
    }, 0);

    return ultimateResult;
};

const processedContent = decodeSource(rawPayload);
const displayValue = calculateOptimalAggregate(processedContent);

displayValue === 0 ? console.log("NONE") : console.log(displayValue);