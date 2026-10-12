(async () => {
    let rawData = '';
    for await (const dataSegment of process.stdin) {
        rawData += dataSegment;
    }

    const inputLines = rawData.split(/\n/);

    const firstLineValues = inputLines[0].split(/\s/).map(valStr => parseInt(valStr, 10));
    const gridHeight = firstLineValues[0];
    const gridWidth = firstLineValues[1];
    const numTargets = firstLineValues[2];

    const targetCoordinates = inputLines.slice(1, numTargets + 1).map(lineContent =>
        lineContent.split(/\s/).map(valStr => parseInt(valStr, 10) - 1)
    );

    const rowHitCounts = new Array(gridHeight).fill(0);
    const colHitCounts = new Array(gridWidth).fill(0);
    const dimensionCounts = [rowHitCounts, colHitCounts];

    const cellPresence = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(false));

    for (const currentCoord of targetCoordinates) {
        const rIdx = currentCoord[0];
        const cIdx = currentCoord[1];
        dimensionCounts[0][rIdx]++;
        dimensionCounts[1][cIdx]++;
        cellPresence[rIdx][cIdx] = true;
    }

    const maxRowCountValues = dimensionCounts[0].slice().sort((a, b) => b - a);
    const maxColCountValues = dimensionCounts[1].slice().sort((a, b) => b - a);

    const highestRowCount = maxRowCountValues[0];
    const highestColCount = maxColCountValues[0];

    const maxColIndices = [];
    for (let colSearchIdx = 0; colSearchIdx < gridHeight; colSearchIdx++) {
        if (dimensionCounts[1][colSearchIdx] === highestColCount) {
            maxColIndices.push(colSearchIdx);
        }
    }

    let isFullyIntersecting = 1;
    const maxRowIndices = [];
    for (let r = 0; r < gridHeight; r++) {
        if (dimensionCounts[0][r] === highestRowCount) {
            maxRowIndices.push(r);
        }
    }

    const intersectionFailed = maxRowIndices.some(rIdx =>
        maxColIndices.some(cIdx => !cellPresence[rIdx][cIdx])
    );

    if (intersectionFailed) {
        isFullyIntersecting = 0;
    }

    const finalResult = highestColCount + highestRowCount - isFullyIntersecting;
    console.log(finalResult);
})();
