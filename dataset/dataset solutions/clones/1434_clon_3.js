const outputProcessedResult = (resultContent) => {
    if (typeof resultContent === 'string' && resultContent.length > 0) {
        console.log(resultContent);
    }
};

const numericLinePattern = /^\d+$/;

const segmentTerminator = "-";

process.stdin.on("data", (inputChunkBuffer) => {
    let currentWorkingString = "";
    let processingStage = 0; // 0: Default (expecting rotation), 1: Non-numeric line processed (expecting numeric skip), 2: Numeric skip processed (expecting rotation)

    const rawInputLines = inputChunkBuffer.toString('utf8').trim().split("\n");

    rawInputLines.some((singleLine) => {
        const cleanedLine = singleLine.trim();

        if (cleanedLine.length === 0) {
            return false;
        }

        if (cleanedLine === segmentTerminator) {
            outputProcessedResult(currentWorkingString);
            return true;
        }

        const isLinePurelyNumeric = numericLinePattern.test(cleanedLine);

        if (!isLinePurelyNumeric) {
            if (currentWorkingString.length > 0) {
                outputProcessedResult(currentWorkingString);
            }

            currentWorkingString = cleanedLine;
            processingStage = 1;
        } else {
            if (processingStage === 1) {
                processingStage = 2;
            } else {
                const rotationValue = Number.parseInt(cleanedLine, 10);

                if (Number.isNaN(rotationValue) || rotationValue < 0) {
                    console.warn(`Warning: Invalid or negative rotation value "${cleanedLine}" encountered. Skipping operation.`);
                    return false;
                }

                if (currentWorkingString.length === 0) {
                    return false;
                }

                const effectiveRotationAmount = rotationValue % currentWorkingString.length;

                currentWorkingString =
                    currentWorkingString.substring(effectiveRotationAmount) +
                    currentWorkingString.substring(0, effectiveRotationAmount);
            }
        }
        return false;
    });
}).resume();