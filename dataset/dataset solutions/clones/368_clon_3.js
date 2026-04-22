'use strict';

const AppKernel = {};

((moduleGateway) => {
    const checkBrowserEnvironment = () => {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    };
    moduleGateway.isWebContext = checkBrowserEnvironment;

    const checkNodeEnvironment = () => {
        return typeof process !== 'undefined' && process.versions && process.versions.node;
    };
    moduleGateway.isServerContext = checkNodeEnvironment;

    const HTML_ENCODE_MAP = Object.freeze({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    });

    const escapeHtmlEntities = (inputString) => {
        const safeString = String(inputString || '');
        return safeString.replace(/[&<>"']/g, (char) => HTML_ENCODE_MAP[char]);
    };
    moduleGateway.htmlEscape = escapeHtmlEntities;

    if (checkBrowserEnvironment()) {
        const renderCodeBlock = (codeToDisplay) => {
            const codeContainer = document.getElementById('code-display');
            if (codeContainer) {
                codeContainer.innerHTML = `<pre><code>${escapeHtmlEntities(codeToDisplay)}</code></pre>`;
            } else {
                console.warn("Code display element not found (id: 'code-display').");
            }
        };
        moduleGateway.displayCode = renderCodeBlock;
    }

    const fetchInputLines = () => {
        let collectedLines = [];

        if (moduleGateway.isWebContext()) {
            const inputElement = document.getElementById('input-data');
            if (inputElement) {
                collectedLines = inputElement.innerHTML
                                   .split(/<br\s*\/?>/i)
                                   .map(line => line.trim())
                                   .filter(line => line.length > 0);
            } else {
                console.error("Input data element not found (id: 'input-data').");
            }
        } else if (moduleGateway.isServerContext()) {
            try {
                const fs = require('fs');
                const rawInput = fs.readFileSync(0, 'utf8');
                collectedLines = rawInput.trim().split('\n');
            } catch (err) {
                console.error("Error reading from stdin in Node.js:", err);
                collectedLines = [];
            }
        }
        return collectedLines;
    };
    moduleGateway.obtainInput = fetchInputLines;

    const setupLineIterator = (lineProcessorCallback) => {
        if (moduleGateway.isWebContext()) {
            const allLines = fetchInputLines();
            allLines.forEach(line => lineProcessorCallback(line));
        } else if (moduleGateway.isServerContext()) {
            const fs = require('fs');
            const readline = require('readline');

            const lineReader = readline.createInterface({
                input: fs.createReadStream('/dev/stdin'),
                output: process.stdout,
                terminal: false
            });

            lineReader.on('line', (currentLine) => {
                lineProcessorCallback(currentLine);
            });
        }
    };
    moduleGateway.processLines = setupLineIterator;

    const outputBuffer = [];
    const outputElementId = 'output-results';

    const renderOutputBatch = (linesToOutput) => {
        if (moduleGateway.isWebContext()) {
            const outputContainer = document.getElementById(outputElementId);
            if (outputContainer) {
                outputContainer.innerHTML = linesToOutput.map(escapeHtmlEntities).join('<br>\n');
            } else {
                console.warn("Output results element not found (id: 'output-results').");
            }
        } else if (moduleGateway.isServerContext()) {
            linesToOutput.forEach(line => console.log(line));
        }
    };
    moduleGateway.publishOutput = renderOutputBatch;

    const appendOutputLine = (singleLine) => {
        if (moduleGateway.isWebContext()) {
            outputBuffer.push(singleLine);
            const outputContainer = document.getElementById(outputElementId);
            if (outputContainer) {
                outputContainer.innerHTML = outputBuffer.map(escapeHtmlEntities).join('<br>\n');
            }
        } else if (moduleGateway.isServerContext()) {
            console.log(singleLine);
        }
    };
    moduleGateway.writeLine = appendOutputLine;

    const initializeApplication = (applicationEntry) => {
        if (moduleGateway.isWebContext()) {
            document.addEventListener('DOMContentLoaded', () => {
                if (typeof applicationEntry === 'function') {
                    moduleGateway.displayCode(applicationEntry.toString());
                }
                applicationEntry();
            });
        } else if (moduleGateway.isServerContext()) {
            applicationEntry();
        }
    };
    moduleGateway.startApp = initializeApplication;

})(AppKernel);


const solveProblem = () => {
    const gameField = Object.freeze({
        minX: 0,
        minY: 0,
        maxX: 10,
        maxY: 10
    });

    const rabbitMovementPatterns = Object.freeze([
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ]);

    const sprinklerEffectZone = Object.freeze([
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ]);

    const isCoordinateValid = (currentX, currentY) => {
        return (currentX >= gameField.minX && currentX < gameField.maxX &&
                currentY >= gameField.minY && currentY < gameField.maxY);
    };

    const calculateValidMoves = (startingLocation, possibleMoves) => {
        const [baseX, baseY] = startingLocation;
        const validDestinations = [];

        for (const [deltaX, deltaY] of possibleMoves) {
            const nextX = baseX + deltaX;
            const nextY = baseY + deltaY;

            if (isCoordinateValid(nextX, nextY)) {
                validDestinations.push([nextX, nextY]);
            }
        }
        return validDestinations;
    };

    const getRabbitNextPositions = (rabbitCurrentPosition) => {
        return calculateValidMoves(rabbitCurrentPosition, rabbitMovementPatterns);
    };

    const getWetTiles = (sprinklerCenter) => {
        return calculateValidMoves(sprinklerCenter, sprinklerEffectZone);
    };

    let memoizationCache;
    let pathHistory;
    let recursionCounter;

    const canRabbitEvade = (currentRabbitPos, remainingSprinklers) => {
        recursionCounter++;

        const cacheKey = `${remainingSprinklers.length}-${currentRabbitPos[0]},${currentRabbitPos[1]}`;

        if (memoizationCache.hasOwnProperty(cacheKey)) {
            return memoizationCache[cacheKey];
        }

        if (remainingSprinklers.length === 0) {
            const survived = true;
            memoizationCache[cacheKey] = survived;
            return survived;
        }

        pathHistory.push(currentRabbitPos);

        const currentSprinkler = remainingSprinklers[0];
        const nextSprinklerSequence = remainingSprinklers.slice(1);

        const rabbitPotentialMoves = getRabbitNextPositions(currentRabbitPos);
        const tilesAffectedBySprinkler = getWetTiles(currentSprinkler);

        for (const nextRabbitPos of rabbitPotentialMoves) {
            const isNextPosWet = tilesAffectedBySprinkler.some(wetTile =>
                wetTile[0] === nextRabbitPos[0] && wetTile[1] === nextRabbitPos[1]
            );

            if (isNextPosWet) {
                if (canRabbitEvade(nextRabbitPos, nextSprinklerSequence)) {
                    pathHistory.pop();
                    memoizationCache[cacheKey] = true;
                    return true;
                }
            }
        }

        pathHistory.pop();
        memoizationCache[cacheKey] = false;
        return false;
    };

    const InputDataCategories = Object.freeze({
        RABBIT_START_POS: 0,
        NUM_SPRINKLERS_COUNT: 1,
        SPRINKLER_POSITIONS: 2
    });

    let currentInputSession;
    let inputLineIndex = 0;

    const parseAndProcessInputLine = (rawLine) => {
        const parsedArguments = rawLine.split(/\s+/).map(Number).filter(n => !isNaN(n));

        const lineCategory = inputLineIndex % Object.keys(InputDataCategories).length;

        if (lineCategory === InputDataCategories.RABBIT_START_POS) {
            currentInputSession = {
                rabbit: { x: parsedArguments[0], y: parsedArguments[1] },
                numSprinklers: 0,
                sprinklerLocations: []
            };
        } else if (lineCategory === InputDataCategories.NUM_SPRINKLERS_COUNT) {
            currentInputSession.numSprinklers = parsedArguments[0];
        } else if (lineCategory === InputDataCategories.SPRINKLER_POSITIONS) {
            for (let i = 0; i < parsedArguments.length; i += 2) {
                currentInputSession.sprinklerLocations.push([parsedArguments[i], parsedArguments[i + 1]]);
            }

            recursionCounter = 0;
            memoizationCache = {};
            pathHistory = [];

            const rabbitInitialPosition = [currentInputSession.rabbit.x, currentInputSession.rabbit.y];
            const allSprinklerPositions = currentInputSession.sprinklerLocations;

            if (canRabbitEvade(rabbitInitialPosition, allSprinklerPositions)) {
                AppKernel.writeLine('OK');
            } else {
                AppKernel.writeLine('NA');
            }
        }
        inputLineIndex++;
    };

    AppKernel.processLines(parseAndProcessInputLine);
};

AppKernel.startApp(solveProblem);