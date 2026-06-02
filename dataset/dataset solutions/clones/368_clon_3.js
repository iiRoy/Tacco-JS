'use strict';
const AppCore = (() => {
    const environment = {};

    const checkBrowserEnv = () => typeof window !== 'undefined';
    environment.isBrowser = checkBrowserEnv;

    const checkNodejsEnv = () => !checkBrowserEnv();
    environment.isNodejs = checkNodejsEnv;

    const core = {};

    core.isBrowser = environment.isBrowser;
    core.isNodejs = environment.isNodejs;

    if (core.isBrowser()) {
        const escapeHtmlEntities = (rawString) => {
            return String(rawString)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
        };
        core.escapeHtmlEntities = escapeHtmlEntities;

        const displaySourceCode = (targetFunction) => {
            document.getElementById('code').innerHTML = `<pre><code>${escapeHtmlEntities(targetFunction)}</code></pre>`;
        };
        core.displaySourceCode = displaySourceCode;
    }

    const retrieveInputLines = () => {
        let inputDataLines = [];
        if (core.isBrowser()) {
            const htmlContent = document.getElementById('input').innerHTML;
            inputDataLines = htmlContent.split('<br>');
            const trimLine = (line) => line.trim();
            inputDataLines = inputDataLines.map(trimLine);
        }
        if (core.isNodejs()) {
            const fs = require('fs');
            inputDataLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return inputDataLines;
    };
    core.retrieveInputLines = retrieveInputLines;

    const configureLineProcessor = (callbackFunction) => {
        if (core.isBrowser()) {
            const inputDataLines = retrieveInputLines();
            for (let i = 0; i < inputDataLines.length; i++) {
                callbackFunction(inputDataLines[i]);
            }
        }
        if (core.isNodejs()) {
            const fs = require('fs');
            const readline = require('readline');
            const readStream = fs.ReadStream('/dev/stdin');
            const readlineInterface = readline.createInterface({ input: readStream, output: {} });
            readlineInterface.on('line', (line) => {
                callbackFunction(line);
            });
        }
    };
    core.configureLineProcessor = configureLineProcessor;

    let bufferedOutput = [];

    const renderOutputLines = (linesToOutput) => {
        if (core.isBrowser()) {
            document.getElementById('output').innerHTML = linesToOutput.map(core.escapeHtmlEntities).join('<br>\n');
        }
        if (core.isNodejs()) {
            for (let i = 0; i < linesToOutput.length; i++) {
                console.log(linesToOutput[i]);
            }
        }
    };
    core.renderOutputLines = renderOutputLines;

    const renderSingleOutputLine = (singleOutputEntry) => {
        if (core.isBrowser()) {
            bufferedOutput.push(singleOutputEntry);
            document.getElementById('output').innerHTML = bufferedOutput.map(core.escapeHtmlEntities).join('<br>\n');
        }
        if (core.isNodejs()) {
            console.log(singleOutputEntry);
        }
    };
    core.renderSingleOutputLine = renderSingleOutputLine;

    const setupApplicationEntry = (entryPointFunction) => {
        if (core.isBrowser()) {
            window.onload = () => {
                core.displaySourceCode(entryPointFunction);
                entryPointFunction();
            };
        }
        if (core.isNodejs()) {
            entryPointFunction();
        }
    };
    core.setupApplicationEntry = setupApplicationEntry;

    return core;
})();

const applicationEntry = () => {
    const gameGrid = {
        minX: 0,
        minY: 0,
        width: 10,
        height: 10
    };

    const playerMovementVectors = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];

    const sprinklerEffectArea = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    const isWithinGridBounds = (xCoord, yCoord) => {
        return (xCoord >= gameGrid.minX && xCoord < gameGrid.width) &&
               (yCoord >= gameGrid.minY && yCoord < gameGrid.height);
    };

    const calculateValidMoves = (currentPosition, movementOffsets) => {
        const validMoves = [];
        if (!movementOffsets || movementOffsets.length === 0) {
            return validMoves;
        }
        for (const offsetVector of movementOffsets) {
            const newX = currentPosition[0] + offsetVector[0];
            const newY = currentPosition[1] + offsetVector[1];
            if (isWithinGridBounds(newX, newY)) {
                validMoves.push([newX, newY]);
            }
        }
        return validMoves;
    };

    const getPlayerNextPositions = (playerCurrentPos) => {
        return calculateValidMoves(playerCurrentPos, playerMovementVectors);
    };

    const getSprinklerAffectedCells = (sprinklerCenter) => {
        return calculateValidMoves(sprinklerCenter, sprinklerEffectArea);
    };

    let memoizationStore;
    let pathTrace;
    let recursionCounter;

    const generateCacheKey = (sprinklerCount, x, y) => `${sprinklerCount},${x},${y}`;

    const canPlayerEvade = (playerCurrentPos, activeSprinklers) => {
        recursionCounter++;
        const cacheKey = generateCacheKey(activeSprinklers.length, playerCurrentPos[0], playerCurrentPos[1]);

        if (memoizationStore.hasOwnProperty(cacheKey)) {
            return memoizationStore[cacheKey];
        }

        pathTrace.push(playerCurrentPos);
        if (activeSprinklers.length <= 0) {
            // console.log('Path Trace: ' + JSON.stringify(pathTrace));
            return true;
        }

        const currentSprinkler = activeSprinklers[0];
        const possiblePlayerMoves = getPlayerNextPositions(playerCurrentPos);
        const sprinklerHazardZones = getSprinklerAffectedCells(currentSprinkler);

        let foundSurvivalPath = false;

        for (const nextPlayerPos of possiblePlayerMoves) {
            const isPlayerInHazard = sprinklerHazardZones.some(hazardCell =>
                nextPlayerPos[0] === hazardCell[0] && nextPlayerPos[1] === hazardCell[1]
            );

            if (isPlayerInHazard) {
                const remainingSprinklers = activeSprinklers.slice(1);
                if (canPlayerEvade(nextPlayerPos, remainingSprinklers)) {
                    foundSurvivalPath = true;
                    break;
                }
            }
        }

        pathTrace.splice(pathTrace.length - 1, 1);
        memoizationStore[cacheKey] = foundSurvivalPath;
        return foundSurvivalPath;
    };

    const inputLineTypeMap = {
        playerStartLocation: 0,
        numSprinklersCount: 1,
        sprinklerPositions: 2
    };

    let currentTestCaseData;
    let processedLineIndex = 0;

    const parseLineToFloats = (lineString) => lineString.split(' ').map(parseFloat);

    const processInputLine = (line) => {
        const parsedValues = parseLineToFloats(line);

        const numCategories = Object.keys(inputLineTypeMap).length;
        const currentLineCategory = processedLineIndex % numCategories;

        switch (currentLineCategory) {
            case inputLineTypeMap.playerStartLocation:
                currentTestCaseData = {
                    player: {},
                    sprinklerLocations: []
                };
                currentTestCaseData.player.x = parsedValues[0];
                currentTestCaseData.player.y = parsedValues[1];
                if (currentTestCaseData.player.x === 0 && currentTestCaseData.player.y === 0) {
                    // console.log('end');
                }
                break;
            case inputLineTypeMap.numSprinklersCount:
                currentTestCaseData.numSprinklers = parsedValues[0];
                break;
            case inputLineTypeMap.sprinklerPositions:
                for (let i = 0; i < parsedValues.length; i += 2) {
                    currentTestCaseData.sprinklerLocations.push([parsedValues[i], parsedValues[i + 1]]);
                }
                // console.log(JSON.stringify(currentTestCaseData));
                recursionCounter = 0;
                memoizationStore = {};
                pathTrace = [];
                if (canPlayerEvade([currentTestCaseData.player.x, currentTestCaseData.player.y], currentTestCaseData.sprinklerLocations)) {
                    AppCore.renderSingleOutputLine('OK');
                } else {
                    AppCore.renderSingleOutputLine('NA');
                }
                // console.log('recursionCounter: ' + recursionCounter);
                break;
            default:
                break;
        }
        processedLineIndex++;
    };

    AppCore.configureLineProcessor(processInputLine);
};

AppCore.setupApplicationEntry(applicationEntry);
