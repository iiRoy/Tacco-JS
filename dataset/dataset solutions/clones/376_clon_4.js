const transformDimensions = (sourceGrid) => {
    const span = sourceGrid.length;
    return Array.from({ length: span }, (_, currentY) =>
        Array.from({ length: span }, (_, currentX) =>
            sourceGrid[span - 1 - currentX][currentY]
        )
    );
};

const acquireSourceContent = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const parseContentIntoMatrix = (rawContent) => {
    return rawContent.trim().split('\n').map(lineSegment => Array.from(lineSegment));
};

const orchestrateRotations = () => {
    let currentMatrixState = parseContentIntoMatrix(acquireSourceContent());

    const rotationStages = [90, 180, 270];
    const outcomes = [];

    for (const angle of rotationStages) {
        currentMatrixState = transformDimensions(currentMatrixState);
        outcomes.push(`${angle}\n${currentMatrixState.join('\n')}`);
    }

    outcomes.forEach(finalOutput => console.log(finalOutput));
};

orchestrateRotations();