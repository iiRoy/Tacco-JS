const EnvironmentController = (() => {
    const RuntimeType = Object.freeze({
        BROWSER_ENV: Symbol('browser'),
        NODE_ENV: Symbol('node')
    });

    let currentRuntimeIdentifier = null;

    const determineRuntime = () => {
        if (currentRuntimeIdentifier) return currentRuntimeIdentifier;
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            currentRuntimeIdentifier = RuntimeType.BROWSER_ENV;
        } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            currentRuntimeIdentifier = RuntimeType.NODE_ENV;
        } else {
            throw new Error("Unknown execution context detected.");
        }
        return currentRuntimeIdentifier;
    };

    const sanitizeForMarkup = (inputContent) => {
        if (determineRuntime() === RuntimeType.BROWSER_ENV) {
            const temporaryContainer = document.createElement('div');
            temporaryContainer.appendChild(document.createTextNode(String(inputContent)));
            return temporaryContainer.innerHTML;
        } else {
            // For Node.js, HTML escaping is not strictly necessary for console output.
            // However, to demonstrate a different implementation path, a basic replacement is used.
            return String(inputContent)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    };

    const retrieveInputRows = async () => {
        if (determineRuntime() === RuntimeType.BROWSER_ENV) {
            const dataSourceElement = document.getElementById('input');
            if (!dataSourceElement) throw new Error("Input source element missing.");
            return dataSourceElement.textContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        } else {
            const { readFile } = require('node:fs/promises');
            const fileData = await readFile('/dev/stdin', 'utf8');
            return fileData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        }
    };

    const processInputSequentially = async (lineProcessorHook) => {
        const allInputLines = await retrieveInputRows();
        for (const currentLine of allInputLines) {
            lineProcessorHook(currentLine);
        }
    };

    const renderOutputMessages = (messagesArray) => {
        if (determineRuntime() === RuntimeType.BROWSER_ENV) {
            const outputTargetElement = document.getElementById('output');
            if (!outputTargetElement) throw new Error("Output target element missing.");
            outputTargetElement.innerHTML = messagesArray.map(sanitizeForMarkup).join('<br>\n');
        } else {
            process.stdout.write(messagesArray.join('\n') + '\n');
        }
    };
    
    let currentOutputAccumulator = [];
    const renderSingleOutputLine = (messageContent) => {
        if (determineRuntime() === RuntimeType.BROWSER_ENV) {
            currentOutputAccumulator.push(messageContent);
            renderOutputMessages(currentOutputAccumulator);
        } else {
            process.stdout.write(messageContent + '\n');
        }
    };

    const presentFunctionSource = (funcReference) => {
        if (determineRuntime() === RuntimeType.BROWSER_ENV) {
            const sourceCodeDisplayElement = document.getElementById('code');
            if (!sourceCodeDisplayElement) return; // Display element is optional
            sourceCodeDisplayElement.textContent = funcReference.toString();
        }
    };

    const launchApplication = (primaryEntryPoint) => {
        if (determineRuntime() === RuntimeType.BROWSER_ENV) {
            window.addEventListener('DOMContentLoaded', () => {
                presentFunctionSource(primaryEntryPoint);
                primaryEntryPoint();
            });
        } else {
            primaryEntryPoint();
        }
    };

    return {
        getRuntime: determineRuntime,
        Environments: RuntimeType,
        sanitizeMarkup: sanitizeForMarkup,
        fetchInput: retrieveInputRows,
        processInputLines: processInputSequentially,
        writeManyLines: renderOutputMessages,
        writeOneLine: renderSingleOutputLine,
        initiateApp: launchApplication,
        showFunctionSource: presentFunctionSource
    };
})();

class GridPoint {
    constructor(xValue, yValue) {
        this.xCoord = xValue;
        this.yCoord = yValue;
    }

    isEqualTo(anotherPoint) {
        return anotherPoint && this.xCoord === anotherPoint.xCoord && this.yCoord === anotherPoint.yCoord;
    }

    toCacheKey() {
        return `${this.xCoord},${this.yCoord}`;
    }
}

class BoundingBox {
    static MIN_X = 0;
    static MIN_Y = 0;
    static MAX_X = 10; // exclusive
    static MAX_Y = 10; // exclusive

    static containsPoint(point) {
        return point.xCoord >= BoundingBox.MIN_X && point.xCoord < BoundingBox.MAX_X &&
               point.yCoord >= BoundingBox.MIN_Y && point.yCoord < BoundingBox.MAX_Y;
    }
}

const KnightMovementPattern = Object.freeze([
    { deltaX: -1, deltaY: -2 }, { deltaX: 0, deltaY: -2 }, { deltaX: 1, deltaY: -2 },
    { deltaX: -2, deltaY: -1 }, { deltaX: 2, deltaY: -1 },
    { deltaX: -2, deltaY: 0 }, { deltaX: 2, deltaY: 0 },
    { deltaX: -2, deltaY: 1 }, { deltaX: 2, deltaY: 1 },
    { deltaX: -1, deltaY: 2 }, { deltaX: 0, deltaY: 2 }, { deltaX: 1, deltaY: 2 }
]);

const WaterSprinklerSpread = Object.freeze([
    { deltaX: -1, deltaY: -1 }, { deltaX: 0, deltaY: -1 }, { deltaX: 1, deltaY: -1 },
    { deltaX: -1, deltaY: 0 }, { deltaX: 0, deltaY: 0 }, { deltaX: 1, deltaY: 0 },
    { deltaX: -1, deltaY: 1 }, { deltaX: 0, deltaY: 1 }, { deltaX: 1, deltaY: 1 }
]);

class CurrentGameData {
    constructor() {
        this.playerLocation = null;
        this.totalSprinklersInPlay = 0;
        this.sprinklerLocations = [];
    }
}

const InputSequenceDefinition = {
    PLAYER_START_COORDS: 0,
    NUMBER_OF_SPRINKLERS: 1,
    SPRINKLER_TILE_COORDS: 2,
    CYCLE_LENGTH: 3 
};

class SurvivalPathfinder {
    constructor() {
        this.memoizedOutcomes = new Map();
        this.traceHistory = [];
    }

    static calculatePotentialPoints(initialPoint, movementVectors) {
        return movementVectors.map(vec => {
            const newX = initialPoint.xCoord + vec.deltaX;
            const newY = initialPoint.yCoord + vec.deltaY;
            return new GridPoint(newX, newY);
        }).filter(BoundingBox.containsPoint);
    }

    // This function rigorously reproduces the original's unique logic:
    // "Can the knight make a move to a spot that is wet by the CURRENT sprinkler,
    // and then from that wet spot, survive all SUBSEQUENT sprinklers?"
    canAgentEndure(agentCurrentPosition, remainingSprinklerConfigurations) {
        const uniqueKey = `${agentCurrentPosition.toCacheKey()}|${remainingSprinklerConfigurations.length}`;
        if (this.memoizedOutcomes.has(uniqueKey)) {
            return this.memoizedOutcomes.get(uniqueKey);
        }

        this.traceHistory.push(agentCurrentPosition);

        if (remainingSprinklerConfigurations.length === 0) {
            this.traceHistory.pop();
            return true; // No more sprinklers, survival is guaranteed.
        }

        const currentSprinkler = remainingSprinklerConfigurations[0];
        const subsequentSprinklers = remainingSprinklerConfigurations.slice(1);

        const agentPossibleNextMoves = SurvivalPathfinder.calculatePotentialPoints(agentCurrentPosition, KnightMovementPattern);
        const currentSprinklerWetTiles = new Set(SurvivalPathfinder.calculatePotentialPoints(currentSprinkler, WaterSprinklerSpread).map(p => p.toCacheKey()));

        let pathDiscovered = false;
        for (const nextMoveCandidate of agentPossibleNextMoves) {
            if (currentSprinklerWetTiles.has(nextMoveCandidate.toCacheKey())) {
                // If a potential next move for the agent IS a tile wet by the current sprinkler,
                // then we recursively check if the agent can endure from this (wet) tile
                // against the subsequent sprinklers.
                if (this.canAgentEndure(nextMoveCandidate, subsequentSprinklers)) {
                    pathDiscovered = true;
                    break; 
                }
            }
        }

        this.traceHistory.pop();
        this.memoizedOutcomes.set(uniqueKey, pathDiscovered);
        return pathDiscovered;
    }
}

const mainSimulationEntry = async () => {
    let activeInputScenario = new CurrentGameData();
    let currentInputLineNumber = 0;

    const processInputRowCallback = (singleInputLine) => {
        const parsedNumericValues = singleInputLine.split(' ').map(Number);
        const inputClassification = currentInputLineNumber % InputSequenceDefinition.CYCLE_LENGTH;

        if (inputClassification === InputSequenceDefinition.PLAYER_START_COORDS) {
            activeInputScenario = new CurrentGameData(); // Reinitialize for new test case
            activeInputScenario.playerLocation = new GridPoint(parsedNumericValues[0], parsedNumericValues[1]);
        } else if (inputClassification === InputSequenceDefinition.NUMBER_OF_SPRINKLERS) {
            activeInputScenario.totalSprinklersInPlay = parsedNumericValues[0];
        } else if (inputClassification === InputSequenceDefinition.SPRINKLER_TILE_COORDS) {
            for (let i = 0; i < parsedNumericValues.length; i += 2) {
                activeInputScenario.sprinklerLocations.push(new GridPoint(parsedNumericValues[i], parsedNumericValues[i + 1]));
            }

            // Only execute the survival check if the player's start is not (0,0), which signals end of input.
            if (!(activeInputScenario.playerLocation.xCoord === 0 && activeInputScenario.playerLocation.yCoord === 0)) {
                const pathSolver = new SurvivalPathfinder();
                if (pathSolver.canAgentEndure(activeInputScenario.playerLocation, activeInputScenario.sprinklerLocations)) {
                    EnvironmentController.writeOneLine('OK');
                } else {
                    EnvironmentController.writeOneLine('NA');
                }
            }
        }
        currentInputLineNumber++;
    };

    await EnvironmentController.processInputLines(processInputRowCallback);
};

EnvironmentController.initiateApp(mainSimulationEntry);