"use strict";

const obtainInputData = () => require("fs").readFileSync("/dev/stdin", "utf8");

const createInputParser = (rawTextContent) => {
    const dataSegments = rawTextContent.split(/ |\n/).filter(Boolean);
    let currentSegmentPointer = 0;

    const extractNumeric = () => Number(dataSegments[currentSegmentPointer++]);
    const extractMultipleNumerics = (count) => Array.from({ length: count }, extractNumeric);
    
    return { extractNumeric, extractMultipleNumerics };
};

const constructNestedArray = (initialFillValue, ...dimensions) => {
    if (dimensions.length === 0) {
        return initialFillValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () =>
        constructNestedArray(initialFillValue, ...remainingDimensions)
    );
};

function processGridForMaxItems() {
    const dataInterpreter = createInputParser(obtainInputData());
    const gridRows = dataInterpreter.extractNumeric();
    const gridCols = dataInterpreter.extractNumeric();
    const totalItems = dataInterpreter.extractNumeric();

    const itemValueMap = new Map();
    Array.from({ length: totalItems }).forEach(() => {
        const [itemRowCoord, itemColCoord, itemWeight] = dataInterpreter.extractMultipleNumerics(3);
        itemValueMap.set(`${itemRowCoord},${itemColCoord}`, itemWeight);
    });

    let currentAccumulatedValues = constructNestedArray(0, gridCols + 1, 4);

    const finalAccumulatedValues = Array.from({ length: gridRows }, (_, rowIndex) => rowIndex + 1).reduce((previousRowValues, currentRowIndex) => {
        const currentRowCalculations = constructNestedArray(0, gridCols + 1, 4);

        Array.from({ length: gridCols }, (_, colIndex) => colIndex + 1).forEach((currentColIndex) => {
            const itemAtCurrentPosition = itemValueMap.get(`${currentRowIndex},${currentColIndex}`) || 0;

            currentRowCalculations[currentColIndex][0] = Math.max(
                previousRowValues[currentColIndex][3],
                currentRowCalculations[currentColIndex - 1][0]
            );

            Array.from({ length: 3 }, (_, itemPickCount) => itemPickCount + 1).forEach((itemsFromCurrentRow) => {
                let currentCellMax = 0;

                currentCellMax = Math.max(currentCellMax, currentRowCalculations[currentColIndex - 1][itemsFromCurrentRow]);
                currentCellMax = Math.max(currentCellMax, previousRowValues[currentColIndex][3]);

                if (itemAtCurrentPosition > 0) {
                    currentCellMax = Math.max(
                        currentCellMax,
                        previousRowValues[currentColIndex][3] + itemAtCurrentPosition
                    );
                    
                    currentCellMax = Math.max(
                        currentCellMax,
                        currentRowCalculations[currentColIndex - 1][itemsFromCurrentRow - 1] + itemAtCurrentPosition
                    );
                }
                currentRowCalculations[currentColIndex][itemsFromCurrentRow] = currentCellMax;
            });
        });
        return currentRowCalculations;
    }, currentAccumulatedValues);

    return Math.max(...finalAccumulatedValues[gridCols]);
}

const finalOutcome = processGridForMaxItems();
if (finalOutcome !== undefined) {
    console.log(String(finalOutcome));
}
