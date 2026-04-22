const fileContentsStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawSourceLines = fileContentsStream.trim().split("\n");

const parseNumericLine = (textualSegment) => textualSegment.split(" ").map(Number);

const processDataSets = (sourceSegments, collectedOutcomes = []) => {
    if (sourceSegments.length === 0) {
        return collectedOutcomes;
    }

    const currentHead = sourceSegments[0];
    const itemCount = parseInt(currentHead, 10);

    if (itemCount === 0) {
        return collectedOutcomes;
    }

    const currentCaseSegments = sourceSegments.slice(1, 1 + itemCount);
    const nextSourceSegments = sourceSegments.slice(1 + itemCount);

    const eventSequence = currentCaseSegments.flatMap(segment => {
        const [loadValue, startCoord, endCoord] = parseNumericLine(segment);
        return [
            [startCoord, loadValue],
            [endCoord - 0.1, -1 * loadValue]
        ];
    });

    eventSequence.sort((eventA, eventB) => eventA[0] - eventB[0]);

    const caseResult = eventSequence.reduce((currentState, currentChange) => {
        if (currentState.status === "NG") {
            return currentState;
        }
        const [, magnitudeChange] = currentChange;
        const newCurrentAggregate = currentState.cumulativeValue + magnitudeChange;
        return {
            cumulativeValue: newCurrentAggregate,
            status: newCurrentAggregate > 150 ? "NG" : "OK"
        };
    }, { cumulativeValue: 0, status: "OK" });

    return processDataSets(nextSourceSegments, collectedOutcomes.concat(caseResult.status));
};

const finalConclusions = processDataSets(rawSourceLines);
finalConclusions.forEach(outcome => console.log(outcome));