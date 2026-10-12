'use strict';
class AppEnvironment {
    static #outputBuffer = [];

    static isBrowserEnv() {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }

    static isNodeEnv() {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    }

    static #htmlEscape(textValue) {
        return String(textValue)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    static displayCodeSnippet(functionReference) {
        if (AppEnvironment.isBrowserEnv()) {
            document.getElementById('code').innerHTML = `<pre><code>${AppEnvironment.#htmlEscape(functionReference)}</code></pre>`;
        }
    }

    static async readAllInputLines() {
        if (AppEnvironment.isBrowserEnv()) {
            const elementContent = document.getElementById('input').innerHTML;
            return elementContent.split('<br>').map(line => line.trim());
        } else if (AppEnvironment.isNodeEnv()) {
            const fileSystem = require('fs').promises;
            const fileData = await fileSystem.readFile('/dev/stdin', 'utf8');
            return fileData.trim().split('\n');
        }
        return [];
    }

    static async processInputByLine(lineHandlerCallback) {
        if (AppEnvironment.isBrowserEnv()) {
            const allLines = await AppEnvironment.readAllInputLines();
            for (const currentLine of allLines) {
                lineHandlerCallback(currentLine);
            }
        } else if (AppEnvironment.isNodeEnv()) {
            const readLineModule = require('readline');
            const fileSystem = require('fs');
            const inputStream = fileSystem.createReadStream('/dev/stdin');
            const lineInterface = readLineModule.createInterface({ input: inputStream, output: {} });
            for await (const currentLine of lineInterface) {
                lineHandlerCallback(currentLine);
            }
        }
    }

    static outputAllLines(linesCollection) {
        if (AppEnvironment.isBrowserEnv()) {
            document.getElementById('output').innerHTML = linesCollection.map(AppEnvironment.#htmlEscape).join('<br>\n');
        } else if (AppEnvironment.isNodeEnv()) {
            for (const line of linesCollection) {
                console.log(line);
            }
        }
    }

    static appendOutputLine(singleLineContent) {
        if (AppEnvironment.isBrowserEnv()) {
            AppEnvironment.#outputBuffer.push(singleLineContent);
            AppEnvironment.outputAllLines(AppEnvironment.#outputBuffer);
        } else if (AppEnvironment.isNodeEnv()) {
            console.log(singleLineContent);
        }
    }

    static async executeMainRoutine(mainExecutionFunction) {
        if (AppEnvironment.isBrowserEnv()) {
            window.onload = async () => {
                AppEnvironment.displayCodeSnippet(mainExecutionFunction);
                await mainExecutionFunction();
            };
        } else if (AppEnvironment.isNodeEnv()) {
            await mainExecutionFunction();
        }
    }
}

class SurvivalGame {
    static #gridOriginX = 0;
    static #gridOriginY = 0;
    static #gridDimensionX = 10;
    static #gridDimensionY = 10;

    static #knightLikeMoves = Object.freeze([
        { dx: -1, dy: -2 }, { dx: 0, dy: -2 }, { dx: 1, dy: -2 },
        { dx: -2, dy: -1 }, { dx: 2, dy: -1 },
        { dx: -2, dy: 0 }, { dx: 2, dy: 0 },
        { dx: -2, dy: 1 }, { dx: 2, dy: 1 },
        { dx: -1, dy: 2 }, { dx: 0, dy: 2 }, { dx: 1, dy: 2 }
    ]);

    static #areaOfEffectMoves = Object.freeze([
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
        { dx: -1, dy: 0 }, { dx: 0, dy: 0 }, { dx: 1, dy: 0 },
        { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
    ]);

    static #InputSectionType = Object.freeze({
        INITIAL_POSITION: 0,
        SPRINKLER_COUNT: 1,
        SPRINKLER_POSITIONS: 2
    });

    static #isCoordinateValid(xCoord, yCoord) {
        return xCoord >= SurvivalGame.#gridOriginX && xCoord < SurvivalGame.#gridDimensionX &&
               yCoord >= SurvivalGame.#gridOriginY && yCoord < SurvivalGame.#gridDimensionY;
    }

    static #computeReachableCoordinates(currentPosition, moveOffsets) {
        return moveOffsets.flatMap(offset => {
            const nextX = currentPosition.x + offset.dx;
            const nextY = currentPosition.y + offset.dy;
            return SurvivalGame.#isCoordinateValid(nextX, nextY) ? [{ x: nextX, y: nextY }] : [];
        });
    }

    static #getPhyonkichiNextSteps(currentPosition) {
        return SurvivalGame.#computeReachableCoordinates(currentPosition, SurvivalGame.#knightLikeMoves);
    }

    static #getSprinklerAffectedArea(sprinklerPosition) {
        return SurvivalGame.#computeReachableCoordinates(sprinklerPosition, SurvivalGame.#areaOfEffectMoves);
    }

    static determineSurvivalPossibility(initialPhyonkichiPos, allSprinklerPositions) {
        const totalSprinklers = allSprinklerPositions.length;
        const dpTable = Array.from({ length: totalSprinklers + 1 }, () =>
            Array.from({ length: SurvivalGame.#gridDimensionY }, () =>
                Array(SurvivalGame.#gridDimensionX).fill(false)
            )
        );

        for (let y = 0; y < SurvivalGame.#gridDimensionY; y++) {
            for (let x = 0; x < SurvivalGame.#gridDimensionX; x++) {
                dpTable[totalSprinklers][y][x] = true;
            }
        }

        for (let k = totalSprinklers - 1; k >= 0; k--) {
            const currentSprinkler = allSprinklerPositions[k];
            const wetSpots = SurvivalGame.#getSprinklerAffectedArea(currentSprinkler);

            for (let y = 0; y < SurvivalGame.#gridDimensionY; y++) {
                for (let x = 0; x < SurvivalGame.#gridDimensionX; x++) {
                    const currentPhyonkichiPos = { x, y };
                    const phyonkichiPotentialMoves = SurvivalGame.#getPhyonkichiNextSteps(currentPhyonkichiPos);

                    const intersectionMoves = phyonkichiPotentialMoves.filter(pm =>
                        wetSpots.some(ws => ws.x === pm.x && ws.y === pm.y)
                    );

                    dpTable[k][y][x] = intersectionMoves.some(im => dpTable[k + 1][im.y][im.x]);
                }
            }
        }

        return dpTable[0][initialPhyonkichiPos.y][initialPhyonkichiPos.x];
    }

    static async processGameInput() {
        let currentInputData = {};
        let inputLineCounter = 0;

        const parseAndSolve = (lineContent) => {
            const numericArgs = lineContent.split(' ').map(Number);
            const sectionType = inputLineCounter % Object.keys(SurvivalGame.#InputSectionType).length;

            if (sectionType === SurvivalGame.#InputSectionType.INITIAL_POSITION) {
                currentInputData = {
                    initialPhyonkichi: { x: numericArgs[0], y: numericArgs[1] },
                    sprinklerCount: 0,
                    sprinklerLocations: []
                };
            } else if (sectionType === SurvivalGame.#InputSectionType.SPRINKLER_COUNT) {
                currentInputData.sprinklerCount = numericArgs[0];
            } else if (sectionType === SurvivalGame.#InputSectionType.SPRINKLER_POSITIONS) {
                for (let i = 0; i < numericArgs.length; i += 2) {
                    currentInputData.sprinklerLocations.push({ x: numericArgs[i], y: numericArgs[i + 1] });
                }

                const result = SurvivalGame.determineSurvivalPossibility(
                    currentInputData.initialPhyonkichi,
                    currentInputData.sprinklerLocations
                );
                AppEnvironment.appendOutputLine(result ? 'OK' : 'NA');
            }
            inputLineCounter++;
        };

        await AppEnvironment.processInputByLine(parseAndSolve);
    }
}

AppEnvironment.executeMainRoutine(SurvivalGame.processGameInput);
