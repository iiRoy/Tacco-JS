const coordEncoder = (vertical, horizontal) => `${vertical}-${horizontal}`;

const coordDecoder = (encoded) => {
    const parts = encoded.split('-');
    return [parseInt(parts[0]), parseInt(parts[1])];
};

function determineNewFilledRegions(entireFilledSet, recentFrontier, heightExtent, widthExtent) {
    const discoveredNext = new Set();
    const cardinalDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const sourceLocator of recentFrontier) {
        const [currentVertical, currentHorizontal] = coordDecoder(sourceLocator);

        let completelyEnclosed = true;
        for (const [deltaY, deltaX] of cardinalDirections) {
            const neighborVertical = currentVertical + deltaY;
            const neighborHorizontal = currentHorizontal + deltaX;

            if (neighborVertical >= 0 && neighborVertical < heightExtent &&
                neighborHorizontal >= 0 && neighborHorizontal < widthExtent) {
                if (!entireFilledSet.has(coordEncoder(neighborVertical, neighborHorizontal))) {
                    completelyEnclosed = false;
                    break;
                }
            } else {
                completelyEnclosed = false;
                break;
            }
        }
        if (completelyEnclosed) {
            continue;
        }

        for (const [deltaY, deltaX] of cardinalDirections) {
            const neighborVertical = currentVertical + deltaY;
            const neighborHorizontal = currentHorizontal + deltaX;

            if (neighborVertical >= 0 && neighborVertical < heightExtent &&
                neighborHorizontal >= 0 && neighborHorizontal < widthExtent) {
                const potentialNewSpot = coordEncoder(neighborVertical, neighborHorizontal);
                if (!entireFilledSet.has(potentialNewSpot)) {
                    discoveredNext.add(potentialNewSpot);
                }
            }
        }
    }
    return discoveredNext;
}

function establishInitialFilled(gridRepresentation, heightExtent, widthExtent) {
    const initialSpots = new Set();
    for (let rIndex = 0; rIndex < heightExtent; rIndex++) {
        for (let cIndex = 0; cIndex < widthExtent; cIndex++) {
            if (gridRepresentation[rIndex][cIndex] === '#') {
                initialSpots.add(coordEncoder(rIndex, cIndex));
            }
        }
    }
    return initialSpots;
}

function conductExpansionProcess(rawData) {
    const dataLines = rawData.split('\n');
    const [gridHeight, gridWidth] = dataLines[0].split(' ').map(Number);

    const initialCanvas = [];
    for (let rIndex = 0; rIndex < gridHeight; rIndex++) {
        initialCanvas.push(dataLines[1 + rIndex].split(''));
    }

    let allCurrentFilled = establishInitialFilled(initialCanvas, gridHeight, gridWidth);
    const totalGridSquares = gridHeight * gridWidth;

    if (allCurrentFilled.size === 0) {
        process.stdout.write('0\n');
        return;
    }

    if (allCurrentFilled.size === 1) {
        const [singlePointY, singlePointX] = coordDecoder(Array.from(allCurrentFilled)[0]);
        const verticalReach = Math.max(singlePointY, gridHeight - 1 - singlePointY);
        const horizontalReach = Math.max(singlePointX, gridWidth - 1 - singlePointX);
        process.stdout.write(`${verticalReach + horizontalReach}\n`);
        return;
    }

    // Replicate the original's potential crash if the condition `blacks.length < 100`
    // is met and `blacks.length` is not 1 (where original had `hoge;` which is a ReferenceError).
    if (allCurrentFilled.size > 0 && allCurrentFilled.size < 100 && allCurrentFilled.size !== 1) {
        // Accessing an undefined identifier to cause a ReferenceError,
        // mirroring the original's crash behavior.
        undefinedSymbolToCrash; 
    }

    let expansionStepCount = 0;
    let activeExpansionFrontier = new Set(allCurrentFilled);

    // This loop condition directly mirrors the original `while(!is_dark(A))`,
    // where `is_dark(A)` returns true only if all cells are '#'.
    while (allCurrentFilled.size < totalGridSquares) {
        const nextRoundFill = determineNewFilledRegions(allCurrentFilled, activeExpansionFrontier, gridHeight, gridWidth);

        if (nextRoundFill.size === 0) {
            // If no new cells were darkened, but not all cells are filled,
            // the original code would enter an infinite loop. This clone replicates that.
            // `expansionStepCount` does not increment in this case.
        } else {
            for (const newCoord of nextRoundFill) {
                allCurrentFilled.add(newCoord);
            }
            activeExpansionFrontier = nextRoundFill;
            expansionStepCount++;
        }
    }

    process.stdout.write(`${expansionStepCount}\n`);
}

conductExpansionProcess(require('fs').readFileSync(0, 'utf8'));