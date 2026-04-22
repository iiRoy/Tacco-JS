const assembleInputProcessor = (sourceData) => {
    let rawLines = sourceData.trim().split('\n');
    let lineCursor = 0;
    let currentLineSegments = [];
    let segmentCursor = 0;

    const advanceLineState = () => {
        if (lineCursor < rawLines.length) {
            currentLineSegments = rawLines[lineCursor].split(' ');
            segmentCursor = 0;
            lineCursor++;
            return true;
        }
        return false;
    };

    if (rawLines.length > 0) {
        advanceLineState();
    }

    const acquireNextValue = (asString = false) => {
        if (segmentCursor >= currentLineSegments.length) {
            if (!advanceLineState()) {
                throw new Error("Input exhaustion: attempted to read past end of data.");
            }
        }
        const value = currentLineSegments[segmentCursor++];
        return asString ? value : Number(value);
    };

    const acquireLineValues = (quantity, asString = false) => {
        const collectedValues = [];
        segmentCursor = currentLineSegments.length; 
        
        for (let k = 0; k < quantity; k++) {
            if (!advanceLineState()) {
                throw new Error(`Input exhaustion: attempted to read line ${k + 1} of ${quantity}.`);
            }
            const lineSegments = currentLineSegments.map(seg => asString ? seg : Number(seg));
            collectedValues.push(...lineSegments);
        }
        return collectedValues;
    };

    return {
        getOne: acquireNextValue,
        getMany: acquireLineValues,
    };
};

const locateInsertionIndex = (orderedCollection, itemValue, begin = 0, end = orderedCollection.length) => {
    if (begin >= end) {
        return begin;
    }
    const midPoint = Math.floor((begin + end) / 2);
    if (orderedCollection[midPoint] <= itemValue) {
        return locateInsertionIndex(orderedCollection, itemValue, midPoint + 1, end);
    } else {
        return locateInsertionIndex(orderedCollection, itemValue, begin, midPoint);
    }
};

const computeSequenceResult = () => {
    const ioProcessor = assembleInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementsCount = ioProcessor.getOne();
    
    if (elementsCount === 0) {
        return 1; // Matches original behavior for n=0
    }

    const dataSeries = ioProcessor.getMany(elementsCount);

    const sortedPiles = dataSeries.reduce((pilesAccumulator, currentElement) => {
        const invertedValue = -currentElement;
        const targetIndex = locateInsertionIndex(pilesAccumulator, invertedValue);

        if (targetIndex === pilesAccumulator.length) {
            pilesAccumulator.push(invertedValue);
        } else {
            pilesAccumulator[targetIndex] = invertedValue;
        }
        return pilesAccumulator;
    }, []);

    return sortedPiles.length;
};

console.log(computeSequenceResult());