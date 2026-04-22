(function() {
    let standardInputBuffer = '';

    globalThis.process.stdin.on('data', (incomingSegment) => {
        standardInputBuffer += incomingSegment;
    });

    globalThis.process.stdin.on('end', () => {
        processCollectedInput(standardInputBuffer);
    });

    const processCollectedInput = (fullText) => {
        const numericTokens = fullText.trim().split(/\s+/g).map(Number);

        if (numericTokens.length < 1) {
            globalThis.console.log(-1);
            return;
        }

        const countOfElements = numericTokens.shift();

        if (countOfElements === undefined || !Number.isInteger(countOfElements) || countOfElements < 0) {
            globalThis.console.log(-1);
            return;
        }

        const elementSequence = numericTokens.slice(0, countOfElements);

        if (elementSequence.length === 0) {
            globalThis.console.log(-1);
            return;
        }

        if (elementSequence[0] !== 0) {
            globalThis.console.log(-1);
            return;
        }

        const initialProcessorState = { calculatedSum: 0, lastObservedValue: 0, encounteredError: false };

        const finalProcessingResult = elementSequence.slice(1).reduce((currentState, currentElement) => {
            if (currentState.encounteredError) {
                return currentState;
            }

            if (!Number.isInteger(currentElement)) {
                return { calculatedSum: -1, lastObservedValue: 0, encounteredError: true };
            }

            const differenceFromPrevious = currentElement - currentState.lastObservedValue;

            if (currentElement >= currentState.lastObservedValue) {
                if (differenceFromPrevious > 1) {
                    return { calculatedSum: -1, lastObservedValue: 0, encounteredError: true };
                } else if (differenceFromPrevious === 1) {
                    return { calculatedSum: currentState.calculatedSum + 1, lastObservedValue: currentElement, encounteredError: false };
                } else { // differenceFromPrevious === 0
                    return { calculatedSum: currentState.calculatedSum + currentElement, lastObservedValue: currentElement, encounteredError: false };
                }
            } else { // currentElement < currentState.lastObservedValue
                return { calculatedSum: currentState.calculatedSum + currentElement, lastObservedValue: currentElement, encounteredError: false };
            }
        }, initialProcessorState);

        if (finalProcessingResult.encounteredError) {
            globalThis.console.log(-1);
        } else {
            globalThis.console.log(finalProcessingResult.calculatedSum);
        }
    };
})();