((environment) => {
    const isBrowserEnv = () => typeof window !== 'undefined';
    const isNodejsEnv = () => !isBrowserEnv();

    const encodeHtmlEntities = (textValue) => {
        const entityMap = new Map([
            ['&', '&amp;'],
            ['"', '&quot;'],
            ["'", '&#39;'],
            ['<', '&lt;'],
            ['>', '&gt;']
        ]);
        return Array.from(String(textValue)).reduce((accumulator, character) =>
            accumulator + (entityMap.has(character) ? entityMap.get(character) : character),
            ''
        );
    };

    const displayCodeSnippet = (functionReference) => {
        if (isBrowserEnv()) {
            const codeOutputElement = document.querySelector('#code');
            if (codeOutputElement) {
                codeOutputElement.innerHTML = `<pre><code>${encodeHtmlEntities(functionReference)}</code></pre>`;
            }
        }
    };

    const retrieveInputLines = () => {
        if (isBrowserEnv()) {
            const inputSourceElement = document.querySelector('#input');
            return inputSourceElement ? inputSourceElement.innerHTML.split('<br>').map(line => line.trim()) : [];
        }
        if (isNodejsEnv()) {
            const fileSystem = require('fs');
            return fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return [];
    };

    const setupLineProcessor = (processingCallback) => {
        if (isBrowserEnv()) {
            retrieveInputLines().forEach(processingCallback);
        }
        if (isNodejsEnv()) {
            const fileSystem = require('fs');
            const readLineModule = require('readline');
            const inputStream = fileSystem.createReadStream('/dev/stdin');
            const lineInterface = readLineModule.createInterface({ input: inputStream, output: {} });
            lineInterface.on('line', processingCallback);
        }
    };

    let bufferedOutputLines = [];
    const writeAllOutput = (linesCollection) => {
        if (isBrowserEnv()) {
            const outputTargetElement = document.querySelector('#output');
            if (outputTargetElement) {
                outputTargetElement.innerHTML = linesCollection.map(encodeHtmlEntities).join('<br>\n');
            }
        }
        if (isNodejsEnv()) {
            linesCollection.forEach(line => console.log(line));
        }
    };

    const writeSingleOutputLine = (contentLine) => {
        if (isBrowserEnv()) {
            bufferedOutputLines.push(contentLine);
            writeAllOutput(bufferedOutputLines);
        }
        if (isNodejsEnv()) {
            console.log(contentLine);
        }
    };

    const executeMainLogic = (primaryFunction) => {
        if (isBrowserEnv()) {
            window.addEventListener('load', () => {
                displayCodeSnippet(primaryFunction);
                primaryFunction();
            });
        }
        if (isNodejsEnv()) {
            primaryFunction();
        }
    };

    environment.AppEnv = {
        setupLineProcessor: setupLineProcessor,
        writeSingleOutputLine: writeSingleOutputLine,
        executeMainLogic: executeMainLogic
    };

})(typeof window !== 'undefined' ? window : global);

const gameMain = () => {
    const gridDimensions = { xMin: 0, yMin: 0, xMax: 10, yMax: 10 };
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

    const currentInputData = {
        phyonkichiStartCoordinates: { x: 0, y: 0 },
        numberOfSprinklers: 0,
        allSprinklerLocations: []
    };

    const InputParsingState = {
        PH_COORDS: 0,
        SPR_COUNT_VAL: 1,
        SPR_LOC_LIST: 2
    };
    let activeParsingState = InputParsingState.PH_COORDS;

    const isLocationWithinBounds = (xCoord, yCoord) =>
        xCoord >= gridDimensions.xMin && xCoord < gridDimensions.xMax &&
        yCoord >= gridDimensions.yMin && yCoord < gridDimensions.yMax;

    const derivePossibleLocations = (originLocation, displacementVectors) => {
        return displacementVectors.flatMap(vector => {
            const newX = originLocation[0] + vector[0];
            const newY = originLocation[1] + vector[1];
            return isLocationWithinBounds(newX, newY) ? [[newX, newY]] : [];
        });
    };

    const getNextPhyonkichiPositions = (currentPhyonkichiLocation) =>
        derivePossibleLocations(currentPhyonkichiLocation, phyonkichiMovementVectors);

    const getSprinklerWetSpots = (sprinklerCenterLocation) =>
        derivePossibleLocations(sprinklerCenterLocation, sprinklerEffectArea);

    const canPhyonkichiSurvive = (initialPhyonkichiPosition, allSprinklerCenters) => {
        const visitedStates = new Map(); // Key: "sprinklerIndex,px,py", Value: true (reachable)
        const explorationQueue = []; // Stores [phyonkichiPosition, sprinklerIndex]

        const totalSprinklers = allSprinklerCenters.length;

        const generateStateKey = (sprinklerIndex, phyonkichiLocation) =>
            `${sprinklerIndex},${phyonkichiLocation[0]},${phyonkichiLocation[1]}`;

        explorationQueue.push([initialPhyonkichiPosition, 0]);
        visitedStates.set(generateStateKey(0, initialPhyonkichiPosition), true);

        while (explorationQueue.length > 0) {
            const [currentPhyonkichiLoc, currentSprinklerIdx] = explorationQueue.shift();

            if (currentSprinklerIdx === totalSprinklers) {
                return true; // All sprinklers processed, a survival path found
            }

            const currentSprinklerCenter = allSprinklerCenters[currentSprinklerIdx];
            const potentialPhyonkichiMoves = getNextPhyonkichiPositions(currentPhyonkichiLoc);
            const currentSprinklerWetSpots = new Set(getSprinklerWetSpots(currentSprinklerCenter).map(loc => `${loc[0]},${loc[1]}`));

            for (const nextPhyonkichiLocOption of potentialPhyonkichiMoves) {
                const nextPhyonkichiLocKey = `${nextPhyonkichiLocOption[0]},${nextPhyonkichiLocOption[1]}`;
                if (currentSprinklerWetSpots.has(nextPhyonkichiLocKey)) {
                    const nextStateKey = generateStateKey(currentSprinklerIdx + 1, nextPhyonkichiLocOption);

                    if (!visitedStates.has(nextStateKey)) {
                        visitedStates.set(nextStateKey, true);
                        explorationQueue.push([nextPhyonkichiLocOption, currentSprinklerIdx + 1]);
                    }
                }
            }
        }

        return false; // No survival path found after exhausting all possibilities
    };

    const handleInputLine = (inputLine) => {
        const numericArguments = inputLine.split(' ').map(Number);

        switch (activeParsingState) {
            case InputParsingState.PH_COORDS:
                currentInputData.phyonkichiStartCoordinates.x = numericArguments[0];
                currentInputData.phyonkichiStartCoordinates.y = numericArguments[1];
                activeParsingState = InputParsingState.SPR_COUNT_VAL;
                break;

            case InputParsingState.SPR_COUNT_VAL:
                currentInputData.numberOfSprinklers = numericArguments[0];
                currentInputData.allSprinklerLocations = [];
                activeParsingState = InputParsingState.SPR_LOC_LIST;
                break;

            case InputParsingState.SPR_LOC_LIST:
                for (let i = 0; i < numericArguments.length; i += 2) {
                    currentInputData.allSprinklerLocations.push([numericArguments[i], numericArguments[i + 1]]);
                }

                const phyonkichiCurrentPosition = [currentInputData.phyonkichiStartCoordinates.x, currentInputData.phyonkichiStartCoordinates.y];
                if (canPhyonkichiSurvive(phyonkichiCurrentPosition, currentInputData.allSprinklerLocations)) {
                    AppEnv.writeSingleOutputLine('OK');
                } else {
                    AppEnv.writeSingleOutputLine('NA');
                }

                activeParsingState = InputParsingState.PH_COORDS; // Reset for next test case
                break;
        }
    };

    AppEnv.setupLineProcessor(handleInputLine);
};

AppEnv.executeMainLogic(gameMain);
