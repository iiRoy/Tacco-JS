function processInputData(rawData) {
    const contentLines = rawData.trim().split('\n');
    const [mapRows, mapCols] = contentLines[0].split(' ').map(Number);
    const [startRowRaw, startColRaw] = contentLines[1].split(' ').map(Number);
    const [targetRowRaw, targetColRaw] = contentLines[2].split(' ').map(Number);

    const startCoordinates = { r: startRowRaw - 1, c: startColRaw - 1 };
    const targetCoordinates = { r: targetRowRaw - 1, c: targetColRaw - 1 };

    const gridLayout = contentLines.slice(3, 3 + mapRows).map(line => line.split(''));

    return { mapRows, mapCols, startCoordinates, targetCoordinates, gridLayout };
}

function calculateMinimumPath(inputBundle) {
    const { mapRows, mapCols, startCoordinates, targetCoordinates, gridLayout } = inputBundle;

    const pathCosts = Array.from({ length: mapRows }, () =>
        Array.from({ length: mapCols }, () => Infinity)
    );

    const instantMoves = [];
    const delayedMoves = [];

    const neighborOffsets = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ];

    pathCosts[startCoordinates.r][startCoordinates.c] = 0;
    instantMoves.push({ r: startCoordinates.r, c: startCoordinates.c, currentCost: 0 });

    let instantHead = 0;
    let delayedHead = 0;

    while (instantHead < instantMoves.length || delayedHead < delayedMoves.length) {
        let currentPosition;
        let currentPathValue;

        if (instantHead < instantMoves.length) {
            currentPosition = instantMoves[instantHead++];
            currentPathValue = currentPosition.currentCost;
        } else {
            currentPosition = delayedMoves[delayedHead++];
            currentPathValue = currentPosition.currentCost;
        }

        const { r, c } = currentPosition;

        if (currentPathValue > pathCosts[r][c]) {
            continue;
        }

        for (const offset of neighborOffsets) {
            const nextR = r + offset.dr;
            const nextC = c + offset.dc;

            if (nextR >= 0 && nextR < mapRows && nextC >= 0 && nextC < mapCols &&
                gridLayout[nextR][nextC] !== '#' && pathCosts[nextR][nextC] > currentPathValue) {
                pathCosts[nextR][nextC] = currentPathValue;
                instantMoves.push({ r: nextR, c: nextC, currentCost: currentPathValue });
            }
        }

        const nextWarpValue = currentPathValue + 1;
        for (let drOffset = -2; drOffset <= 2; drOffset++) {
            for (let dcOffset = -2; dcOffset <= 2; dcOffset++) {
                const nextR = r + drOffset;
                const nextC = c + dcOffset;

                if (nextR >= 0 && nextR < mapRows && nextC >= 0 && nextC < mapCols &&
                    gridLayout[nextR][nextC] !== '#' && pathCosts[nextR][nextC] > nextWarpValue) {
                    pathCosts[nextR][nextC] = nextWarpValue;
                    delayedMoves.push({ r: nextR, c: nextC, currentCost: nextWarpValue });
                }
            }
        }
    }

    const finalResult = pathCosts[targetCoordinates.r][targetCoordinates.c];
    return finalResult === Infinity ? -1 : finalResult;
}

function processChallenge(challengeInput) {
    const structuredData = processInputData(challengeInput);
    return calculateMinimumPath(structuredData);
}