function processInputData(inputSource) {
    const allLines = inputSource.split('\n');

    const initialBoundarySpecifiers = allLines[0].split(' ').map(Number);
    const initialUpperX = initialBoundarySpecifiers[0];
    const initialUpperY = initialBoundarySpecifiers[1];

    const constraintRecords = allLines.slice(1).filter(Boolean).map(lineText => {
        const parts = lineText.split(' ').map(Number);
        return {
            xCoordinate: parts[0],
            yCoordinate: parts[1],
            operationKind: parts[2]
        };
    });

    const initialRectangleState = {
        lowerXBound: 0,
        upperXBound: initialUpperX,
        lowerYBound: 0,
        upperYBound: initialUpperY,
    };

    const boundaryUpdateOperations = {
        1: (currentRect, val) => ({ ...currentRect, lowerXBound: Math.max(currentRect.lowerXBound, val) }),
        2: (currentRect, val) => ({ ...currentRect, upperXBound: Math.min(currentRect.upperXBound, val) }),
        3: (currentRect, val) => ({ ...currentRect, lowerYBound: Math.max(currentRect.lowerYBound, val) }),
        4: (currentRect, val) => ({ ...currentRect, upperYBound: Math.min(currentRect.upperYBound, val) }),
    };

    const finalRectangleState = constraintRecords.reduce((accumulator, currentRecord) => {
        const handlerFunction = boundaryUpdateOperations[currentRecord.operationKind];
        if (handlerFunction) {
            const relevantCoordinate = (currentRecord.operationKind === 1 || currentRecord.operationKind === 2)
                ? currentRecord.xCoordinate
                : currentRecord.yCoordinate;
            return handlerFunction(accumulator, relevantCoordinate);
        }
        return accumulator;
    }, initialRectangleState);

    const extentX = finalRectangleState.upperXBound - finalRectangleState.lowerXBound;
    const extentY = finalRectangleState.upperYBound - finalRectangleState.lowerYBound;

    const calculatedSurfaceArea = extentX * extentY;

    if (calculatedSurfaceArea < 1) {
        console.log(0);
    } else {
        console.log(calculatedSurfaceArea);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
