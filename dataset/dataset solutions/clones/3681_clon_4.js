"use strict";

const processDataRecursively = (dataBundle, currentIdx, accResult) => {
    const sourceContent = dataBundle.source;
    const stepInterval = dataBundle.interval;

    if (currentIdx >= sourceContent.length) {
        return accResult;
    }

    const nextAccResult = accResult + sourceContent.charAt(currentIdx);
    const nextIdx = currentIdx + stepInterval;

    return processDataRecursively(dataBundle, nextIdx, nextAccResult);
};

const initiateProcessing = (externalInput) => {
    const contentParts = externalInput.trim().split("\n");
    const dataObject = {
        source: contentParts[0],
        interval: parseInt(contentParts[1])
    };

    const finalOutput = processDataRecursively(dataObject, 0, "");
    console.log(finalOutput);
};

initiateProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));