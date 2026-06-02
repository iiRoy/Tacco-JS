'use strict';
class RuntimeContext {
    constructor() {
        this.isBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';
        this.isNodeEnv = !this.isBrowserEnv;
        this.outputAccumulator = [];
    }
    static escapeHtml(rawString) {
        return String(rawString)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    displaySourceCode(codeFunction) {
        if (this.isBrowserEnv) {
            const codeElement = document.getElementById('code');
            if (codeElement) {
                codeElement.innerHTML = '<pre><code>' + RuntimeContext.escapeHtml(codeFunction) + '</code></pre>';
            }
        }
    }
    async fetchAllInputLines() {
        if (this.isBrowserEnv) {
            const inputElement = document.getElementById('input');
            if (inputElement) {
                return inputElement.innerHTML.split('<br>').map(line => line.trim());
            }
            return [];
        } else if (this.isNodeEnv) {
            const fs = require('fs').promises;
            const data = await fs.readFile('/dev/stdin', 'utf8');
            return data.trim().split('\n');
        }
        return [];
    }
    emitOutputLine(lineContent) {
        if (this.isBrowserEnv) {
            this.outputAccumulator.push(lineContent);
            const outputElement = document.getElementById('output');
            if (outputElement) {
                outputElement.innerHTML = this.outputAccumulator.map(RuntimeContext.escapeHtml).join('<br>\n');
            }
        } else if (this.isNodeEnv) {
            console.log(lineContent);
        }
    }
    executeMainLogic(applicationLogic) {
        if (this.isBrowserEnv) {
            window.onload = () => {
                this.displaySourceCode(applicationLogic);
                applicationLogic();
            };
        } else if (this.isNodeEnv) {
            applicationLogic();
        }
    }
}
class SurvivalGame {
    constructor() {
        this.gridDimensions = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        this.phyonkichiDisplacements = [
            [-1, -2], [0, -2], [1, -2],
            [-2, -1], [2, -1],
            [-2, 0], [2, 0],
            [-2, 1], [2, 1],
            [-1, 2], [0, 2], [1, 2]
        ];
        this.sprinklerCoverageOffsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [0, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];
    }
    isCoordinateValid(xCoord, yCoord) {
        return xCoord >= this.gridDimensions.minX && xCoord < this.gridDimensions.maxX &&
               yCoord >= this.gridDimensions.minY && yCoord < this.gridDimensions.maxY;
    }
    computeReachableCoordinates(startLocation, moveVectors) {
        return moveVectors.reduce((accumulatedLocations, currentMove) => {
            const nextX = startLocation[0] + currentMove[0];
            const nextY = startLocation[1] + currentMove[1];
            if (this.isCoordinateValid(nextX, nextY)) {
                accumulatedLocations.push([nextX, nextY]);
            }
            return accumulatedLocations;
        }, []);
    }
    determinePhyonkichiOptions(currentPhyonkichiPosition) {
        return this.computeReachableCoordinates(currentPhyonkichiPosition, this.phyonkichiDisplacements);
    }
    identifySprinklerEffect(sprinklerPosition) {
        return this.computeReachableCoordinates(sprinklerPosition, this.sprinklerCoverageOffsets);
    }
    findSurvivalPath(initialPhyonkichiPos, allSprinklerPositions) {
        const totalSprinklers = allSprinklerPositions.length;
        const explorationQueue = [[initialPhyonkichiPos[0], initialPhyonkichiPos[1], 0]];
        const visitedStates = new Set();
        visitedStates.add(`${initialPhyonkichiPos[0]},${initialPhyonkichiPos[1]},0`);
        while (explorationQueue.length > 0) {
            const [currentPX, currentPY, currentSIdx] = explorationQueue.shift();
            if (currentSIdx === totalSprinklers) {
                return true;
            }
            const currentSprinklerLocation = allSprinklerPositions[currentSIdx];
            const nextPhyonkichiPossiblePositions = this.determinePhyonkichiOptions([currentPX, currentPY]);
            const wetSpotsFromCurrentSprinkler = this.identifySprinklerEffect(currentSprinklerLocation);
            const wetSpotSet = new Set(wetSpotsFromCurrentSprinkler.map(loc => `${loc[0]},${loc[1]}`));
            for (const [nextPX, nextPY] of nextPhyonkichiPossiblePositions) {
                if (wetSpotSet.has(`${nextPX},${nextPY}`)) {
                    const nextSprinklerIndex = currentSIdx + 1;
                    const newStateKey = `${nextPX},${nextPY},${nextSprinklerIndex}`;
                    if (!visitedStates.has(newStateKey)) {
                        visitedStates.add(newStateKey);
                        explorationQueue.push([nextPX, nextPY, nextSprinklerIndex]);
                    }
                }
            }
        }
        return false;
    }
}
const runtime = new RuntimeContext();
const game = new SurvivalGame();
const gameEntryPoint = async () => {
    const allInputLines = await runtime.fetchAllInputLines();
    const scenarios = [];
    let lineCursor = 0;
    while (lineCursor < allInputLines.length) {
        const phyonkichiCoords = allInputLines[lineCursor].split(' ').map(Number);
        if (phyonkichiCoords[0] === 0 && phyonkichiCoords[1] === 0) {
            break;
        }
        lineCursor++;
        const numSprinklers = Number(allInputLines[lineCursor]);
        lineCursor++;
        const sprinklerCoords = [];
        let remainingSprinklerLines = Math.ceil(numSprinklers / 2);
        while (remainingSprinklerLines > 0) {
            const currentLine = allInputLines[lineCursor].split(' ').map(Number);
            for (let i = 0; i < currentLine.length; i += 2) {
                sprinklerCoords.push([currentLine[i], currentLine[i + 1]]);
            }
            lineCursor++;
            remainingSprinklerLines--;
        }
        scenarios.push({
            initialPhyonkichi: phyonkichiCoords,
            sprinklers: sprinklerCoords.slice(0, numSprinklers)
        });
    }
    for (const scenario of scenarios) {
        const canSurviveResult = game.findSurvivalPath(scenario.initialPhyonkichi, scenario.sprinklers);
        runtime.emitOutputLine(canSurviveResult ? 'OK' : 'NA');
    }
};
runtime.executeMainLogic(gameEntryPoint);
