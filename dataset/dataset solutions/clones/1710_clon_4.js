'use strict'

const deriveNumericMatrix = (inputContent) => {
    const lineSegments = inputContent.split('\n');
    const relevantSegments = lineSegments.slice(2);
    return relevantSegments.map(segment => segment.split(' ').map(Number));
};

const pinpointHighestValueIndices = (dataGrid) => {
    return dataGrid.map(rowUnit => {
        if (rowUnit.length === 0) {
            return 1;
        }

        const { position } = rowUnit.reduce((collector, currentValueElement, currentElementIndex) => {
            if (currentElementIndex === 0) {
                return { value: currentValueElement, position: currentElementIndex };
            }
            if (currentValueElement > collector.value) {
                return { value: currentValueElement, position: currentElementIndex };
            }
            return collector;
        }, { value: undefined, position: 0 });

        return position + 1;
    });
};

const executeProcessing = (sourceMaterial) => {
    const processedGrid = deriveNumericMatrix(sourceMaterial);
    const calculatedPositions = pinpointHighestValueIndices(processedGrid);
    displayFinalResult(calculatedPositions);
};

const displayFinalResult = (outcomeArray) => {
    console.log(outcomeArray);
};

const retrieveSystemInput = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

executeProcessing(retrieveSystemInput());