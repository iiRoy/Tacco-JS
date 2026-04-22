(async () => {
    const acquireStreamData = async () => {
        let streamContents = [];
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        const dataCollectionPromise = new Promise(resolve => {
            process.stdin.on('data', fragment => {
                streamContents.push(...fragment.trim().split('\n'));
            });
            process.stdin.on('end', () => {
                resolve(streamContents);
            });
        });
        return dataCollectionPromise;
    };

    const transformRawToStructure = (sourceLines) => {
        let settings = {};
        let currentLineIndex = 0;
        let constructedLadder = [];

        for (const currentLine of sourceLines) {
            if (currentLine === "0") break;

            if (currentLineIndex === 0) { settings.verticalDimension = parseInt(currentLine); }
            else if (currentLineIndex === 1) { settings.entryPoint = parseInt(currentLine) - 1; }
            else if (currentLineIndex === 2) { settings.exitPoint = parseInt(currentLine) - 1; }
            else if (currentLineIndex === 3) { settings.maximumSteps = parseInt(currentLine); }
            else {
                const rawBarIndicators = Array.from(currentLine).map(Number);
                const processedRow = Array(settings.verticalDimension).fill(0);
                for (let j = 0; j < rawBarIndicators.length; j++) {
                    if (rawBarIndicators[j] === 1) {
                        processedRow[j] = 1;
                        if (j + 1 < settings.verticalDimension) {
                            processedRow[j + 1] = -1;
                        }
                    }
                }
                constructedLadder.push(processedRow);
            }
            currentLineIndex++;
        }
        settings.horizontalDimension = constructedLadder.length;
        return { parameters: settings, gridLayout: constructedLadder };
    };

    const navigateCourse = (currentDepth, currentColumn, courseGrid, depthIncrement, columnModifier, accumulatedPositions = []) => {
        if (currentDepth < 0 || currentDepth >= courseGrid.length) {
            return accumulatedPositions.concat(currentColumn);
        }
        const nextColumn = currentColumn + (courseGrid[currentDepth][currentColumn] * columnModifier);
        return navigateCourse(currentDepth + depthIncrement, nextColumn, courseGrid, depthIncrement, columnModifier, accumulatedPositions.concat(currentColumn));
    };

    const receivedInputLines = await acquireStreamData();
    const { parameters, gridLayout } = transformRawToStructure(receivedInputLines);

    const initialTrajectory = navigateCourse(0, parameters.entryPoint, gridLayout, 1, 1);
    const targetTrajectoryRaw = navigateCourse(parameters.horizontalDimension - 1, parameters.exitPoint, gridLayout, -1, -1);
    const targetTrajectory = targetTrajectoryRaw.reverse();

    let finalVerdict = "";

    if (initialTrajectory[initialTrajectory.length - 1] === parameters.exitPoint) {
        finalVerdict = "0";
    } else {
        const potentialInsertionLayer = Array.from({length: parameters.maximumSteps}, (_, layerIdx) => layerIdx)
            .findIndex(layerIdx => {
                if (layerIdx >= initialTrajectory.length || layerIdx >= targetTrajectory.length) return false;

                const currentInitialColumn = initialTrajectory[layerIdx];
                const currentTargetColumn = targetTrajectory[layerIdx];

                const areAdjacent = Math.abs(currentInitialColumn - currentTargetColumn) === 1;
                const haveClearSpace = gridLayout[layerIdx][currentInitialColumn] === 0 &&
                                       gridLayout[layerIdx][currentTargetColumn] === 0;

                return areAdjacent && haveClearSpace;
            });

        if (potentialInsertionLayer !== -1) {
            const smallerColumn = Math.min(initialTrajectory[potentialInsertionLayer], targetTrajectory[potentialInsertionLayer]);
            finalVerdict = `${potentialInsertionLayer + 1} ${smallerColumn + 1}`;
        } else {
            finalVerdict = "1";
        }
    }

    console.log(finalVerdict);

})();