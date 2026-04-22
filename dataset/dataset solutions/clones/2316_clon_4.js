"use strict";

class DataSource {
    #inputLines;
    #currentLineIdx;
    #lineTokensBuffer;

    constructor(sourceData) {
        this.#inputLines = sourceData.trim().split("\n");
        this.#currentLineIdx = 0;
        this.#lineTokensBuffer = null;
    }

    fetchNextValue(wantString = false) {
        if (this.#lineTokensBuffer === null || this.#lineTokensBuffer.length === 0) {
            if (this.#currentLineIdx >= this.#inputLines.length) {
                throw new Error("End of input for single values.");
            }
            this.#lineTokensBuffer = this.#inputLines[this.#currentLineIdx].split(" ").reverse();
        }

        const value = this.#lineTokensBuffer.pop();
        if (this.#lineTokensBuffer.length === 0) {
            this.#currentLineIdx++;
            this.#lineTokensBuffer = null;
        }
        return wantString ? value : Number(value);
    }

    fetchLineValues(wantStrings = false) {
        if (this.#currentLineIdx >= this.#inputLines.length) {
            throw new Error("End of input for full lines.");
        }
        const lineContent = this.#inputLines[this.#currentLineIdx].split(" ");
        this.#currentLineIdx++;
        this.#lineTokensBuffer = null;
        return wantStrings ? lineContent : lineContent.map(val => Number(val));
    }
}

const acquireInput = new DataSource(require("node:fs").readFileSync("/dev/stdin", "utf8"));

function calculateOptimalCount() {
    const totalItems = acquireInput.fetchNextValue();
    const maxAllowance = acquireInput.fetchNextValue();
    const requiredPasses = acquireInput.fetchNextValue();
    const topThreshold = acquireInput.fetchNextValue();

    let itemScores = acquireInput.fetchLineValues();
    itemScores.sort((first, second) => first - second);

    let highIndex = totalItems - topThreshold;
    let lowIndex = -1;

    while (highIndex - lowIndex > 1) {
        const testIndex = Math.floor((highIndex + lowIndex) / 2);
        const boostedScoreThreshold = itemScores[testIndex] + maxAllowance;

        if (boostedScoreThreshold < itemScores[totalItems - topThreshold]) {
            lowIndex = testIndex;
        } else if (requiredPasses <= testIndex + topThreshold) {
            highIndex = testIndex;
        } else {
            let boostDeficit = 0;
            for (let currentItemIdx = testIndex + 1; currentItemIdx <= totalItems - topThreshold; currentItemIdx++) {
                boostDeficit += boostedScoreThreshold - itemScores[currentItemIdx];
            }
            
            const availableBoost = (requiredPasses - testIndex - topThreshold) * maxAllowance;

            if (availableBoost >= boostDeficit) {
                highIndex = testIndex;
            } else {
                lowIndex = testIndex;
            }
        }
    }
    return totalItems - highIndex;
}

console.log(calculateOptimalCount());