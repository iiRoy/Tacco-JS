function calculateMaximumIllumination(sourceText) {
    const contentLines = sourceText.split('\n');
    contentLines.shift();
    const gridStructure = contentLines.map(lineSegment => lineSegment.split(''));

    let peakIllumination = 0;

    const potentialLampLocations = gridStructure.flatMap((rowCharacters, rowIdx) =>
        rowCharacters.flatMap((cellCharacter, colIdx) =>
            cellCharacter === '.' ? [{ r: rowIdx, c: colIdx }] : []
        )
    );

    if (potentialLampLocations.length > 0) {
        const illuminationScores = potentialLampLocations.map(position =>
            determineLightPropagation(gridStructure, position.r, position.c)
        );
        peakIllumination = Math.max(...illuminationScores);
    }

    console.log(peakIllumination);
}

function* traverseDirection(gridData, startR, startC, deltaR, deltaC) {
    let currentR = startR + deltaR;
    let currentC = startC + deltaC;
    const totalRows = gridData.length;
    const totalCols = gridData[0].length;

    while (currentR >= 0 && currentR < totalRows && currentC >= 0 && currentC < totalCols) {
        const squareType = gridData[currentR][currentC];
        if (squareType === '.') {
            yield 1;
        } else if (squareType === '#') {
            break;
        }
        currentR += deltaR;
        currentC += deltaC;
    }
}

function determineLightPropagation(gridData, initialR, initialC) {
    let illuminatedCount = 1;

    const directionVectors = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    for (const [rowChange, colChange] of directionVectors) {
        for (const litSquare of traverseDirection(gridData, initialR, initialC, rowChange, colChange)) {
            illuminatedCount += litSquare;
        }
    }
    return illuminatedCount;
}

calculateMaximumIllumination(require("fs").readFileSync("/dev/stdin", "utf8"));