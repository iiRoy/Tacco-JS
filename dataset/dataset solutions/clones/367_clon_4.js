'use strict';

const ApplicationUtilities = (() => {
    const ascertainEnvironment = () => {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    };

    const ascertainNodeEnv = () => {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    };

    const secureDisplayContent = (textData) => {
        let resultBuffer = '';
        const charSequence = String(textData);
        for (let i = 0; i < charSequence.length; i++) {
            const char = charSequence[i];
            switch (char) {
                case '&': resultBuffer += '&amp;'; break;
                case '"': resultBuffer += '&quot;'; break;
                case "'": resultBuffer += '&#39;'; break;
                case '<': resultBuffer += '&lt;'; break;
                case '>': resultBuffer += '&gt;'; break;
                default: resultBuffer += char;
            }
        }
        return resultBuffer;
    };

    const outputSourceCode = (sourceFunction) => {
        if (acertainEnvironment()) {
            const displayElement = document.getElementById('source_view');
            if (displayElement) {
                displayElement.innerHTML = `<pre><code>${secureDisplayContent(sourceFunction)}</code></pre>`;
            }
        }
    };

    let currentOutputAccumulator = [];
    const printSingleLine = (lineContent) => {
        if (acertainEnvironment()) {
            const outputContainer = document.getElementById('result_display');
            if (outputContainer) {
                currentOutputAccumulator.push(lineContent);
                outputContainer.innerHTML = currentOutputAccumulator.map(secureDisplayContent).join('<br>\n');
            }
        } else if (acertainNodeEnv()) {
            process.stdout.write(lineContent + '\n');
        }
    };

    const printMultiLine = (contentLines) => {
        if (acertainEnvironment()) {
            const outputContainer = document.getElementById('result_display');
            if (outputContainer) {
                currentOutputAccumulator = contentLines;
                outputContainer.innerHTML = currentOutputAccumulator.map(secureDisplayContent).join('<br>\n');
            }
        } else if (acertainNodeEnv()) {
            for (const line of contentLines) {
                process.stdout.write(line + '\n');
            }
        }
    };

    const setupInputProcessor = (processCallback) => {
        if (acertainEnvironment()) {
            const dataElement = document.getElementById('input_data');
            if (dataElement) {
                const rawText = dataElement.textContent || dataElement.innerText;
                const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                for (const line of lines) {
                    processCallback(line);
                }
            }
        } else if (acertainNodeEnv()) {
            const fileSystemModule = require('fs');
            const streamModule = require('readline');
            const dataStream = fileSystemModule.createReadStream('/dev/stdin', { encoding: 'utf8' });
            const lineReader = streamModule.createInterface({ input: dataStream, output: process.stdout });
            lineReader.on('line', (dataLine) => {
                processCallback(dataLine);
            });
            lineReader.on('close', () => {
            });
        }
    };

    const initializeExecution = (primaryRoutine) => {
        if (acertainEnvironment()) {
            window.addEventListener('load', () => {
                outputSourceCode(primaryRoutine);
                primaryRoutine();
            });
        } else if (acertainNodeEnv()) {
            primaryRoutine();
        }
    };

    return {
        isBrowserContext: ascertainEnvironment,
        isNodeContext: ascertainNodeEnv,
        htmlEncodeString: secureDisplayContent,
        showFunctionCode: outputSourceCode,
        sendOutputLine: printSingleLine,
        sendOutputBatch: printMultiLine,
        registerLineHandler: setupInputProcessor,
        startProgram: initializeExecution
    };
})();

class ScenarioEvaluator {
    constructor() {
        this.boundary = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        
        this.creaturePathOptions = [
            { dx: -1, dy: -2 }, { dx: 0, dy: -2 }, { dx: 1, dy: -2 },
            { dx: -2, dy: -1 }, { dx: 2, dy: -1 },
            { dx: -2, dy: 0 }, { dx: 2, dy: 0 },
            { dx: -2, dy: 1 }, { dx: 2, dy: 1 },
            { dx: -1, dy: 2 }, { dx: 0, dy: 2 }, { dx: 1, dy: 2 }
        ];

        this.deviceEffectArea = [];
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                this.deviceEffectArea.push({ dx: x, dy: y });
            }
        }

        this.currentScenario = {
            creatureOrigin: null,
            sprinklerCount: 0,
            sprinklerPlacement: []
        };

        this.inputPhase = 0;
        this.inputPhaseSchema = {
            CREATURE_START: 0,
            SPRINKLER_QUANTITY: 1,
            SPRINKLER_COORDS: 2
        };
    }

    isPositionValid(coordX, coordY) {
        return coordX >= this.boundary.minX && coordX < this.boundary.maxX &&
               coordY >= this.boundary.minY && coordY < this.boundary.maxY;
    }

    getReachablePositions(startPosition, movementRules) {
        const potentialPositions = [];
        for (const move of movementRules) {
            const nextX = startPosition.x + move.dx;
            const nextY = startPosition.y + move.dy;
            if (this.isPositionValid(nextX, nextY)) {
                potentialPositions.push({ x: nextX, y: nextY });
            }
        }
        return potentialPositions;
    }

    getNextCreaturePositions(currentCreaturePosition) {
        return this.getReachablePositions(currentCreaturePosition, this.creaturePathOptions);
    }

    getSprinklerWetArea(sprinklerAnchor) {
        return this.getReachablePositions(sprinklerAnchor, this.deviceEffectArea);
    }

    assessSurvivalOpportunity(initialCreatureLocation, allSprinklerLocations) {
        const searchQueue = [];
        const visitedStates = new Set(); 

        const encodeState = (cx, cy, sIdx) => `${cx},${cy},${sIdx}`;

        if (allSprinklerLocations.length === 0) {
            return true;
        }

        searchQueue.push({ cx: initialCreatureLocation.x, cy: initialCreatureLocation.y, sIdx: 0 });
        visitedStates.add(encodeState(initialCreatureLocation.x, initialCreatureLocation.y, 0));

        while (searchQueue.length > 0) {
            const { cx, cy, sIdx } = searchQueue.shift();

            if (sIdx === allSprinklerLocations.length) {
                return true;
            }

            const currentSprinkler = allSprinklerLocations[sIdx];
            const wetZones = this.getSprinklerWetArea(currentSprinkler);
            const nextCreatureMoves = this.getNextCreaturePositions({ x: cx, y: cy });

            for (const nextCreaturePos of nextCreatureMoves) {
                const isWet = wetZones.some(wetPos => 
                    wetPos.x === nextCreaturePos.x && wetPos.y === nextCreaturePos.y
                );

                if (isWet) {
                    const nextState = { cx: nextCreaturePos.x, cy: nextCreaturePos.y, sIdx: sIdx + 1 };
                    const nextStateKey = encodeState(nextState.cx, nextState.cy, nextState.sIdx);

                    if (!visitedStates.has(nextStateKey)) {
                        visitedStates.add(nextStateKey);
                        searchQueue.push(nextState);
                    }
                }
            }
        }

        return false;
    }

    processIncomingLine(dataLine) {
        const numericArgs = dataLine.split(' ').map(Number);

        switch (this.inputPhase) {
            case this.inputPhaseSchema.CREATURE_START:
                this.currentScenario.creatureOrigin = { x: numericArgs[0], y: numericArgs[1] };
                this.inputPhase = this.inputPhaseSchema.SPRINKLER_QUANTITY;
                break;

            case this.inputPhaseSchema.SPRINKLER_QUANTITY:
                this.currentScenario.sprinklerCount = numericArgs[0];
                this.inputPhase = this.inputPhaseSchema.SPRINKLER_COORDS;
                break;

            case this.inputPhaseSchema.SPRINKLER_COORDS:
                this.currentScenario.sprinklerPlacement = [];
                for (let k = 0; k < numericArgs.length; k += 2) {
                    this.currentScenario.sprinklerPlacement.push({ x: numericArgs[k], y: numericArgs[k + 1] });
                }

                const outcome = this.assessSurvivalOpportunity(
                    this.currentScenario.creatureOrigin,
                    this.currentScenario.sprinklerPlacement
                );
                ApplicationUtilities.sendOutputLine(outcome ? 'OK' : 'NA');

                this.inputPhase = this.inputPhaseSchema.CREATURE_START;
                break;
            default:
                break;
        }
    }
}

const programEntry = () => {
    const evaluatorInstance = new ScenarioEvaluator();
    ApplicationUtilities.registerLineHandler(evaluatorInstance.processIncomingLine.bind(evaluatorInstance));
};

ApplicationUtilities.startProgram(programEntry);