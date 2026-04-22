const dataAcquirer = (fullInputTextContent) => {
    let lineStore = fullInputTextContent.trim().split('\n');
    let currentLineCursor = 0;
    let currentLineTokenBuffer = [];

    const obtainToken = (asStringOutput = false) => {
        while (currentLineTokenBuffer.length === 0) {
            if (currentLineCursor >= lineStore.length) return undefined;
            const currentRawLine = lineStore[currentLineCursor++];
            currentLineTokenBuffer = currentRawLine.split(' ').filter(token => token !== '');
        }
        const extractedToken = currentLineTokenBuffer.shift();
        return asStringOutput ? extractedToken : parseFloat(extractedToken);
    };

    const obtainLine = (asStringOutput = false) => {
        if (currentLineCursor >= lineStore.length) return undefined;
        const currentRawLine = lineStore[currentLineCursor++];
        const lineParts = currentRawLine.split(' ').filter(part => part !== '');
        return asStringOutput ? lineParts : lineParts.map(Number);
    };

    const obtainBlock = (itemCount, asStringOutput = false) => {
        const retrievedItems = [];
        for (let k = 0; k < itemCount; k++) {
            retrievedItems.push(obtainLine(asStringOutput));
        }
        return retrievedItems;
    };

    return {
        fetchScalar: obtainToken,
        fetchSequence: obtainLine,
        fetchMatrix: obtainBlock,
        fetchRows: obtainBlock, // Functionally similar to fetchBlock for rows of single numbers
    };
};

const dimensionedArrayBuilder = (initialFillValue, ...dimensions) => {
    const constructDimension = (dimensionList) => {
        if (dimensionList.length === 0) {
            return initialFillValue;
        }
        const currentDimensionSize = dimensionList[0];
        const remainingDimensions = dimensionList.slice(1);
        return Array.from({ length: currentDimensionSize }, () => constructDimension(remainingDimensions));
    };
    return constructDimension(dimensions);
};

const processInputCalculations = () => {
    const inputSource = dataAcquirer(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementCount = inputSource.fetchScalar();
    const numericalElements = inputSource.fetchSequence();

    if (elementCount < 1) {
        return "";
    }
    if (elementCount === 1) {
        const soleElement = numericalElements[0];
        return `${-soleElement}\n${soleElement} ${soleElement}`;
    }

    const orderedElements = [...numericalElements].sort((valA, valB) => valA - valB);
    const lowestValue = orderedElements[0];
    const highestValue = orderedElements[elementCount - 1];
    const centralElements = orderedElements.slice(1, elementCount - 1);

    const finalAccumulatedTotal = -lowestValue + centralElements.reduce((total, current) => total + Math.abs(current), 0) + Math.abs(highestValue);

    let operationEntries = [];
    let runningTally = lowestValue;

    centralElements.filter(item => item >= 0)
                   .forEach(item => {
                       operationEntries.push(`${runningTally} ${item}`);
                       runningTally -= item;
                   });

    operationEntries.push(`${highestValue} ${runningTally}`);
    runningTally = highestValue - runningTally;

    centralElements.filter(item => item < 0)
                   .forEach(item => {
                       operationEntries.push(`${runningTally} ${item}`);
                       runningTally -= item;
                   });

    return [finalAccumulatedTotal, ...operationEntries].join('\n');
};

console.log(processInputCalculations());