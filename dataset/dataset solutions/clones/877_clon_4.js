const sourceMaterial = require('node:fs').readFileSync(0, 'utf8');

const rawLineSeries = sourceMaterial.trim().split('\n');

const interpretTimeAsMinutes = (timeRepresentation) => {
    const timeParts = timeRepresentation.split(':').map(Number);
    return timeParts[0] * 60 + timeParts[1];
};

const processSequentialBlocks = (allInputLines, startingIndex = 0, aggregatedResults = []) => {
    if (startingIndex >= allInputLines.length) {
        return aggregatedResults;
    }

    const controlParameters = allInputLines[startingIndex].split(' ').map(Number);
    const dataEntryCount = controlParameters[0];
    const minimumInterval = controlParameters[1];

    const blockDataStartIndex = startingIndex + 1;
    const blockDataEndIndex = blockDataStartIndex + dataEntryCount;
    const currentBlockData = allInputLines.slice(blockDataStartIndex, blockDataEndIndex);

    const blockEvaluation = currentBlockData.reduce((stateAccumulator, currentDataItem, dataIndex) => {
        const itemComponents = currentDataItem.split(' ');
        const eventBeginTimeStr = itemComponents[0];
        const eventEndTimeStr = itemComponents[2];
        const eventLabel = itemComponents[3];

        const eventBeginMinutes = interpretTimeAsMinutes(eventBeginTimeStr);
        const eventEndMinutes = interpretTimeAsMinutes(eventEndTimeStr);

        if (dataIndex > 0 && stateAccumulator.previousEventEndMinutes !== null) {
            const calculatedDuration = eventBeginMinutes - stateAccumulator.previousEventEndMinutes;
            if (calculatedDuration >= minimumInterval) {
                stateAccumulator.findingsForBlock.push(`${stateAccumulator.previousEventLabel} ${calculatedDuration}`);
            }
        }

        stateAccumulator.previousEventEndMinutes = eventEndMinutes;
        stateAccumulator.previousEventLabel = eventLabel;

        return stateAccumulator;
    }, { previousEventEndMinutes: null, previousEventLabel: null, findingsForBlock: [] });

    aggregatedResults.push(blockEvaluation.findingsForBlock);

    return processSequentialBlocks(allInputLines, blockDataEndIndex, aggregatedResults);
};

const finalOutputCollections = processSequentialBlocks(rawLineSeries);

finalOutputCollections.forEach(individualCollection => {
    if (individualCollection.length === 0) {
        console.log(0);
    } else {
        console.log(individualCollection.length);
        individualCollection.forEach(entry => console.log(entry));
    }
});