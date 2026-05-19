'use strict';
const UtilityKit = {};
(function(utilScope) {
    const checkBrowserEnv = () => typeof window !== 'undefined';
    utilScope.isClientSide = checkBrowserEnv;

    const checkNodejsEnv = () => !checkBrowserEnv();
    utilScope.isServerSide = checkNodejsEnv;

    const getDomElement = (id) => document.getElementById(id);

    utilScope.bufferedOutputLines = [];

    if (checkBrowserEnv()) {
        const HTML_AMP_REGEX = /&/g;
        const HTML_QUOTE_REGEX = /"/g;
        const HTML_APOS_REGEX = /'/g;
        const HTML_LT_REGEX = /</g;
        const HTML_GT_REGEX = />/g;

        const encodeHtmlEntities = (inputString) => {
            return String(inputString)
                    .replace(HTML_AMP_REGEX, '&amp;')
                    .replace(HTML_QUOTE_REGEX, '&quot;')
                    .replace(HTML_APOS_REGEX, '&#39;')
                    .replace(HTML_LT_REGEX, '&lt;')
                    .replace(HTML_GT_REGEX, '&gt;');
        };
        utilScope.escapeHtml = encodeHtmlEntities;

        const displayCodeSnippet = (targetFunction) => {
            getDomElement('code').innerHTML = `<pre><code>${encodeHtmlEntities(targetFunction)}</code></pre>`;
        };
        utilScope.renderCodeBlock = displayCodeSnippet;
    }

    const retrieveInputLines = () => {
        let inputLines = [];
        if (checkBrowserEnv()) {
            const html = getDomElement('input').innerHTML;
            inputLines = html.split('<br>').map(line => line.trim());
        }
        if (checkNodejsEnv()) {
            inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return inputLines;
    };

    const configureInputReader = (lineHandlerCallback) => {
        if (checkBrowserEnv()) {
            const lines = retrieveInputLines();
            lines.forEach(lineHandlerCallback);
        }
        if (checkNodejsEnv()) {
            const fs = require('fs');
            const readline = require('readline');
            const readStream = fs.ReadStream('/dev/stdin');
            const readlineInterface = readline.createInterface({'input': readStream, 'output': {}});
            readlineInterface.on('line', lineHandlerCallback);
        }
    };
    utilScope.setupLineProcessor = configureInputReader;

    const displayResults = (outputContentLines) => {
        if (checkBrowserEnv()) {
            getDomElement('output').innerHTML = outputContentLines.map(utilScope.escapeHtml).join('<br>\n');
        }
        if (checkNodejsEnv()) {
            outputContentLines.forEach(line => console.log(line));
        }
    };
    utilScope.renderOutputLines = displayResults;

    const writeSingleOutput = (singleLineContent) => {
        if (checkBrowserEnv()) {
            utilScope.bufferedOutputLines.push(singleLineContent);
            getDomElement('output').innerHTML = utilScope.bufferedOutputLines.map(utilScope.escapeHtml).join('<br>\n');
        }
        if (checkNodejsEnv()) {
            console.log(singleLineContent);
        }
    };
    utilScope.appendOutputLine = writeSingleOutput;

    const runMainLogic = (mainFunctionRef) => {
        if (checkBrowserEnv()) {
            window.onload = () => {
                utilScope.renderCodeBlock(mainFunctionRef);
                mainFunctionRef();
            };
        }
        if (checkNodejsEnv()) {
            mainFunctionRef();
        }
    };
    utilScope.initializeApplication = runMainLogic;
})(UtilityKit);

const appEntry = () => {
    const gridConfig = {
        minX: 0,
        minY: 0,
        width: 10,
        height: 10
    };
    const phyonkichiMovementVectors = [
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
    const inputLineTypes = {
        phyonkichiPosType: 0,
        sprinklerCountType: 1,
        sprinklerPosListType: 2
    };
    let currentInputData;
    let processedLineCounter = 0;

    const isWithinGridBounds = (coordX, coordY) => {
        return (coordX >= gridConfig.minX && coordX < gridConfig.width) &&
               (coordY >= gridConfig.minY && coordY < gridConfig.height);
    };

    const calculatePotentialPositions = (currentPosition, movementOffsets) => {
        const movedLocations = [];
        for (const offsetVector of movementOffsets) {
            const coordX = currentPosition[0] + offsetVector[0];
            const coordY = currentPosition[1] + offsetVector[1];
            if (isWithinGridBounds(coordX, coordY)) {
                movedLocations.push([coordX, coordY]);
            }
        }
        return movedLocations;
    };

    const determinePhyonkichiNextMoves = (pkCurrentPos) => calculatePotentialPositions(pkCurrentPos, phyonkichiMovementVectors);

    const identifyWetSpots = (currentSprinklerPos) => calculatePotentialPositions(currentSprinklerPos, sprinklerEffectArea);

    let memoizationStore;
    let pathTraceStack;
    let recursionDepthCounter;

    const areLocationsEqual = (loc1, loc2) => loc1[0] === loc2[0] && loc1[1] === loc2[1];

    const checkSurvivalPossibility = (pkCurrentPos, sprinklerPositions) => {
        recursionDepthCounter++;
        const memoKey = `${sprinklerPositions.length}, ${pkCurrentPos[0]}, ${pkCurrentPos[1]}`;

        if (memoKey in memoizationStore) {
            return memoizationStore[memoKey];
        }

        pathTraceStack.push(pkCurrentPos);
        if (sprinklerPositions.length <= 0) {
            return true;
        }

        const currentSprinklerPos = sprinklerPositions[0];
        const pkPossibleNextPositions = determinePhyonkichiNextMoves(pkCurrentPos);
        const sprinklerAffectedAreas = identifyWetSpots(currentSprinklerPos);

        const canFindSurvivalPath = pkPossibleNextPositions.some(pkNextCandidatePos => {
            const isNextPosWet = sprinklerAffectedAreas.some(affectedSpot => areLocationsEqual(pkNextCandidatePos, affectedSpot));

            if (isNextPosWet) {
                const remainingSprinklers = sprinklerPositions.slice(1);
                const canContinue = checkSurvivalPossibility(pkNextCandidatePos, remainingSprinklers);
                if (canContinue) {
                    return true;
                }
            }
            return false;
        });

        if (canFindSurvivalPath) {
            return true;
        }

        pathTraceStack.splice(pathTraceStack.length - 1, 1);
        memoizationStore[memoKey] = false;
        return false;
    };

    const processInputLine = (line) => {
        const lineArguments = line.split(' ').map(parseFloat);
        const currentDataType = processedLineCounter % Object.keys(inputLineTypes).length;

        switch (currentDataType) {
            case inputLineTypes.phyonkichiPosType:
                currentInputData = {
                    phyonkichi: { x: lineArguments[0], y: lineArguments[1] },
                    sprinklerLocations: []
                };
                break;
            case inputLineTypes.sprinklerCountType:
                currentInputData.numSprinklers = lineArguments[0];
                break;
            case inputLineTypes.sprinklerPosListType:
                currentInputData.sprinklerLocations = Array.from({ length: lineArguments.length / 2 }, (_, i) => [lineArguments[i * 2], lineArguments[i * 2 + 1]]);

                recursionDepthCounter = 0;
                memoizationStore = {};
                pathTraceStack = [];
                if (checkSurvivalPossibility([currentInputData.phyonkichi.x, currentInputData.phyonkichi.y], currentInputData.sprinklerLocations)) {
                    UtilityKit.appendOutputLine('OK');
                } else {
                    UtilityKit.appendOutputLine('NA');
                }
                break;
            default:
                break;
        }
        processedLineCounter++;
    };
    UtilityKit.setupLineProcessor(processInputLine);
};

UtilityKit.initializeApplication(appEntry);
