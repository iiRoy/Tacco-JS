const showResult = console.log;

const lineToNumbers = (inputLine) => {
    if (typeof inputLine !== 'string') {
        return [];
    }
    return inputLine.split(/\s+/).filter(Boolean).map(Number);
};

const aggregateValues = (dataCollection) => {
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        return 0;
    }
    return dataCollection.reduce((accum, current) => accum + current, 0);
};

const formatElements = (elementCollection) => {
    if (!Array.isArray(elementCollection)) {
        return [];
    }
    return elementCollection.map((val) => String(val).padStart(5, ' '));
};

const processBatch = (remainingInputLines, outputEmitter) => {
    if (remainingInputLines.length === 0) {
        return;
    }

    const quantityRaw = remainingInputLines.shift();
    const currentQuantity = Number(quantityRaw);

    if (currentQuantity === 0) {
        return;
    }

    let batchColumnAccumulators = Array(11).fill(0);

    const iterateRows = (rowIndex, currentAccumulators) => {
        if (rowIndex >= currentQuantity || isNaN(currentQuantity)) {
            return currentAccumulators;
        }

        const rawDataRow = remainingInputLines.shift();
        const numericRowData = lineToNumbers(rawDataRow);
        const rowTotalValue = aggregateValues(numericRowData);
        const completeRowData = [...numericRowData, rowTotalValue];

        outputEmitter(formatElements(completeRowData).join(''));

        const updatedAccumulators = currentAccumulators.map((sumComponent, index) => {
            return sumComponent + (completeRowData[index] || 0);
        });

        return iterateRows(rowIndex + 1, updatedAccumulators);
    };

    batchColumnAccumulators = iterateRows(0, batchColumnAccumulators);

    outputEmitter(formatElements(batchColumnAccumulators.slice(0, currentQuantity + 1)).join(''));

    processBatch(remainingInputLines, outputEmitter);
};

const entryPoint = (sourceText) => {
    const dataLines = sourceText.split('\n');
    processBatch(dataLines, showResult);
};

entryPoint(require("node:fs").readFileSync("input.txt", "utf8"));