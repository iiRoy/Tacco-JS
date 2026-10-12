const acquireDataSegments = (incomingText) => {
    return incomingText.trim().split(/\s+/g);
};

const executeComputation = (inputString) => {
    let dataSegments = acquireDataSegments(inputString);
    let segmentPointer = 0;

    const retrieveNumericValue = () => {
        return parseInt(dataSegments[segmentPointer++], 10);
    };

    const retrieveLargeNumericValue = () => {
        return BigInt(dataSegments[segmentPointer++]);
    };

    const elementCount = retrieveNumericValue();
    const maximumAllowedCost = retrieveLargeNumericValue();

    const collectionAlpha = [];
    let peakValueAlpha = 0;
    for (let iterator = 0; iterator < elementCount; iterator++) {
        const individualValue = retrieveNumericValue();
        collectionAlpha.push(individualValue);
        if (individualValue > peakValueAlpha) peakValueAlpha = individualValue;
    }

    const collectionBeta = [];
    let peakValueBeta = 0;
    for (let iterator = 0; iterator < elementCount; iterator++) {
        const individualValue = retrieveNumericValue();
        collectionBeta.push(individualValue);
        if (individualValue > peakValueBeta) peakValueBeta = individualValue;
    }

    collectionAlpha.sort((valA, valB) => valA - valB);
    collectionBeta.sort((valA, valB) => valB - valA);

    let searchFloor = -1;
    let searchCeiling = peakValueAlpha * peakValueBeta;

    while (Math.abs(searchCeiling - searchFloor) > 1) {
        const midPoint = Math.floor((searchCeiling + searchFloor) / 2);
        let accumulatedInfringement = 0n;

        for (let index = 0; index < elementCount; index++) {
            const combinedProduct = collectionAlpha[index] * collectionBeta[index];
            if (combinedProduct > midPoint) {
                const excessAmount = BigInt(combinedProduct - midPoint);
                const reductionUnit = BigInt(collectionBeta[index]);
                accumulatedInfringement += (excessAmount + reductionUnit - 1n) / reductionUnit;
            }
        }

        if (maximumAllowedCost >= accumulatedInfringement) {
            searchCeiling = midPoint;
        } else {
            searchFloor = midPoint;
        }
    }

    console.log(searchCeiling);
};

const initiateOperation = () => {
    const fileIO = require("fs");
    const rawContent = fileIO.readFileSync("/dev/stdin", "utf8");
    executeComputation(rawContent);
};

initiateOperation();