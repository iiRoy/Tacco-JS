class DataStream {
    #sourceLines;
    #lineCursor = 0;
    #currentLineTokens = null;

    constructor(rawContent) {
        this.#sourceLines = rawContent.trim().split('\n');
    }

    extractSingle(asString = false) {
        if (this.#currentLineTokens === null || this.#currentLineTokens.length === 0) {
            if (this.#lineCursor >= this.#sourceLines.length) {
                return asString ? undefined : NaN;
            }
            this.#currentLineTokens = this.#sourceLines[this.#lineCursor].split(' ').reverse();
        }

        const value = this.#currentLineTokens.pop();

        if (this.#currentLineTokens.length === 0) {
            this.#lineCursor++;
            this.#currentLineTokens = null;
        }

        return asString ? value : Number(value);
    }

    extractLine(asStrings = false) {
        if (this.#lineCursor >= this.#sourceLines.length) {
            return [];
        }
        const line = this.#sourceLines[this.#lineCursor++];
        this.#currentLineTokens = null;
        const tokens = line.split(' ');
        return asStrings ? tokens : tokens.map(Number);
    }

    extractMatrix(count, asStrings = false) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.extractLine(asStrings));
        }
        return result;
    }

    extractRows(count, asStrings = false) {
        const result = [];
        for (let i = 0; i < count; i++) {
            if (this.#lineCursor >= this.#sourceLines.length) break;
            const line = this.#sourceLines[this.#lineCursor++];
            this.#currentLineTokens = null;
            result.push(asStrings ? line : Number(line));
        }
        return result;
    }
}

function calculatePath() {
    const gridHeight = inputHandler.extractSingle();
    const gridWidth = inputHandler.extractSingle();
    const obstacleCount = inputHandler.extractSingle();

    const blockedPositions = new Map();

    for (let yCoord = 0; yCoord <= gridHeight; yCoord++) {
        if (!blockedPositions.has(yCoord)) {
            blockedPositions.set(yCoord, new Set());
        }
        blockedPositions.get(yCoord).add(gridWidth + 1);
    }

    for (let k = 0; k < obstacleCount; k++) {
        const obstacleCoords = inputHandler.extractLine();
        const obsX = obstacleCoords[0];
        const obsY = obstacleCoords[1];

        if (!blockedPositions.has(obsY)) {
            blockedPositions.set(obsY, new Set());
        }
        blockedPositions.get(obsY).add(obsX);
    }

    const rowOneBlocks = blockedPositions.get(1) || new Set();
    let currentPathLimit = Math.min(...Array.from(rowOneBlocks)) - 1;

    let currentXPosition = 2;

    const finalState = Array.from({ length: gridHeight - 1 }, (_, idx) => idx + 2)
        .reduce((accumulator, currentRowY) => {
            let [prevXCandidate, prevPathLimit] = accumulator;

            if (prevXCandidate > prevPathLimit) {
                return [prevXCandidate, prevPathLimit];
            }

            let nextXCandidate = prevXCandidate;
            const currentRowBlocks = blockedPositions.get(currentRowY) || new Set();
            while (currentRowBlocks.has(nextXCandidate)) {
                nextXCandidate++;
            }

            const sortedBlocksInRow = Array.from(currentRowBlocks).sort((a, b) => a - b);
            for (const blockX of sortedBlocksInRow) {
                if (blockX >= nextXCandidate) {
                    prevPathLimit = Math.min(prevPathLimit, blockX - 1);
                    break;
                }
            }

            return [nextXCandidate + 1, prevPathLimit];

        }, [currentXPosition, currentPathLimit]);

    return finalState[1];
}

var inputHandler = new DataStream(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculatePath());
