'use strict';
(function(inputContent) {
    const allInputLines = inputContent.toString().split('\n');
    const initialContent = allInputLines.shift();
    const operationCount = Number(allInputLines.shift());
    const parsedOperations = allInputLines.slice(0, operationCount).map(line => line.split(' '));

    const initialProcessorState = {
        currentText: initialContent,
        collectedOutputs: []
    };

    const processPrint = (state, startIndex, endIndex) => {
        const segment = state.currentText.substring(startIndex, endIndex + 1);
        return {
            ...state,
            collectedOutputs: [...state.collectedOutputs, segment]
        };
    };

    const processReverse = (state, startIndex, endIndex) => {
        const prefix = state.currentText.substring(0, startIndex);
        const segmentToReverse = state.currentText.substring(startIndex, endIndex + 1);
        const reversedSegment = segmentToReverse.split('').reverse().join('');
        const suffix = state.currentText.substring(endIndex + 1);
        const newText = prefix + reversedSegment + suffix;
        return {
            ...state,
            currentText: newText
        };
    };

    const processSubstitute = (state, startIndex, endIndex, replacementValue) => {
        const prefix = state.currentText.substring(0, startIndex);
        const suffix = state.currentText.substring(endIndex + 1);
        const newText = prefix + replacementValue + suffix;
        return {
            ...state,
            currentText: newText
        };
    };

    const applyTextOperation = (currentState, operationDetails) => {
        const [operationName, startIdxStr, endIdxStr, valueParam] = operationDetails;
        const start = Number(startIdxStr);
        const end = Number(endIdxStr);

        switch (operationName) {
            case 'print':
                return processPrint(currentState, start, end);
            case 'reverse':
                return processReverse(currentState, start, end);
            case 'replace':
                return processSubstitute(currentState, start, end, valueParam);
            default:
                return currentState;
        }
    };

    const finalProcessorState = parsedOperations.reduce(applyTextOperation, initialProcessorState);

    console.log(finalProcessorState.collectedOutputs.join('\n'));

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
