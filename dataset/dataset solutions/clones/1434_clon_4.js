const createTextTransformer = () => {
    const transformationState = {
        currentContent: "",
        isAwaitingFirstRotation: false,
        partialInput: ""
    };

    const executeShiftOperation = (sourceText, shiftAmount) => {
        if (!sourceText) return "";
        const actualShift = shiftAmount % sourceText.length;
        return sourceText.substring(actualShift) + sourceText.substring(0, actualShift);
    };

    const processSingleInputLine = (inputLineValue, currentContent, awaitingFirstRotationFlag) => {
        let nextContent = currentContent;
        let nextAwaitingFirstRotation = awaitingFirstRotationFlag;
        let outputToEmit = null;
        let shouldTerminateChunkProcessing = false;

        const processedLine = inputLineValue.trim();

        if (processedLine === "-") {
            outputToEmit = currentContent;
            shouldTerminateChunkProcessing = true;
        } else if (!/^\d+$/.test(processedLine)) {
            if (currentContent) {
                outputToEmit = currentContent;
            }
            nextContent = processedLine;
            nextAwaitingFirstRotation = true;
        } else {
            const numericValue = parseInt(processedLine, 10);
            if (awaitingFirstRotationFlag) {
                nextAwaitingFirstRotation = false;
            } else {
                nextContent = executeShiftOperation(currentContent, numericValue);
            }
        }
        return {
            nextContent,
            nextAwaitingFirstRotation,
            outputToEmit,
            shouldTerminateChunkProcessing
        };
    };

    const ingestInputChunk = (dataBufferSegment) => {
        transformationState.partialInput += dataBufferSegment;
        const completeLines = transformationState.partialInput.split('\n');

        transformationState.partialInput = completeLines.pop();

        for (const lineEntry of completeLines) {
            const { nextContent, nextAwaitingFirstRotation, outputToEmit, shouldTerminateChunkProcessing } =
                processSingleInputLine(lineEntry, transformationState.currentContent, transformationState.isAwaitingFirstRotation);

            transformationState.currentContent = nextContent;
            transformationState.isAwaitingFirstRotation = nextAwaitingFirstRotation;

            if (outputToEmit !== null) {
                process.stdout.write(outputToEmit + '\n');
            }

            if (shouldTerminateChunkProcessing) {
                transformationState.partialInput = "";
                return;
            }
        }
    };

    return { ingestInputChunk };
};

const streamProcessorInstance = createTextTransformer();

process.stdin.on("data", (incomingData) => {
    streamProcessorInstance.ingestInputChunk(incomingData.toString());
}).resume();