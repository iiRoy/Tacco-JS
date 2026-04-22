const process = require('process');
let acquiredData = '';
process.stdin.on('data', fragment => { acquiredData += fragment; });
process.stdin.on('end', () => {
    let numericalSequence = acquiredData.trim().split(/\s+/).values();
    const grabNextNumber = () => Number(numericalSequence.next().value);
    const grabNextString = () => numericalSequence.next().value;

    const finalOutcome = computeOptimalArrangement(grabNextNumber, grabNextString);
    if (finalOutcome !== undefined) {
        console.log(finalOutcome);
    }
});

class ElementData {
    constructor(numericValue, initialPosition) {
        this.numericValue = numericValue;
        this.initialPosition = initialPosition;
    }
}

function computeOptimalArrangement(getNumberInput, getStringInput) {
    const totalElements = getNumberInput();
    const originalCollection = Array.from({ length: totalElements }, (_, currentIdx) =>
        new ElementData(getNumberInput(), currentIdx)
    );

    let highestSumValue = 0;

    Array.from({ length: totalElements - 1 }, (_, separator) => separator + 1)
        .forEach(boundaryIndex => {
            const rightSegment = originalCollection.filter(item => item.initialPosition >= boundaryIndex);
            const leftSegment = originalCollection.filter(item => item.initialPosition < boundaryIndex);

            const orderedRightSegment = [...rightSegment].sort((itemA, itemB) => itemB.numericValue - itemA.numericValue);
            const orderedLeftSegment = [...leftSegment].sort((itemA, itemB) => itemA.numericValue - itemB.numericValue);

            let currentCandidateSum = 0;
            let arrangementFeasible = true;

            arrangementFeasible = orderedRightSegment.every((item, ordinalRank) => {
                const shiftAmount = item.initialPosition - ordinalRank;
                if (shiftAmount < 0) {
                    return false;
                } else {
                    currentCandidateSum += shiftAmount * item.numericValue;
                    return true;
                }
            });

            if (arrangementFeasible) {
                arrangementFeasible = orderedLeftSegment.every((item, ordinalRank) => {
                    const adjustedFinalRank = ordinalRank + orderedRightSegment.length;
                    const shiftAmount = adjustedFinalRank - item.initialPosition;
                    if (shiftAmount < 0) {
                        return false;
                    } else {
                        currentCandidateSum += shiftAmount * item.numericValue;
                        return true;
                    }
                });
            }

            if (arrangementFeasible && currentCandidateSum > highestSumValue) {
                highestSumValue = currentCandidateSum;
            }
        });

    return highestSumValue;
}