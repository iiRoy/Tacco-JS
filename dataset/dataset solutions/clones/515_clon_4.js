const acquireSourcePayload = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const processPayloadSegments = (remainingSegments, collectedOutcomes = []) => {
    if (remainingSegments.length === 0) {
        return collectedOutcomes;
    }

    const currentSegmentIdentifierString = remainingSegments[0];
    const currentSegmentIdentifier = parseInt(currentSegmentIdentifierString, 10);

    if (currentSegmentIdentifier === 0) {
        return collectedOutcomes;
    }

    const primaryNumericText = remainingSegments[1].split(" ");
    const primaryNumericValues = primaryNumericText.map(Number);

    const secondaryNumericText = remainingSegments[2].split(" ");
    const secondaryNumericValues = secondaryNumericText.map(Number);

    const currentSegmentOutcome = calculateMaximizedScore(currentSegmentIdentifier, primaryNumericValues, secondaryNumericValues);
    
    return processPayloadSegments(remainingSegments.slice(3), [...collectedOutcomes, currentSegmentOutcome]);
};

const calculateMaximizedScore = (initialFactor, primaryOperands, secondaryOperands) => {
    const baseTotal = primaryOperands.reduce((accumulator, value) => accumulator + value, 0);

    const sortedSecondaryOperands = [...secondaryOperands].sort((elementA, elementB) => elementB - elementA);

    let ultimateScore = baseTotal * initialFactor;

    const candidateScores = sortedSecondaryOperands.map((currentSecondaryOperand, positionIndex) => {
        const adjustedFactor = initialFactor - (positionIndex + 1);

        if (adjustedFactor <= 0) {
            return 0; 
        }
        return (baseTotal + currentSecondaryOperand) * adjustedFactor;
    });

    return Math.max(ultimateScore, ...candidateScores);
};

const fullInputPayload = acquireSourcePayload();
const parsedInputLines = fullInputPayload.trim().split("\n");

const finalOutcomeCollection = processPayloadSegments(parsedInputLines);

finalOutcomeCollection.forEach(resultEntry => console.log(resultEntry));