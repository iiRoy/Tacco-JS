class InputProcessor {
    constructor(sourceText) {
        this.lineSegments = sourceText.trim().split('\n');
        this.currentLinePointer = 0;
        this.activeLineTokens = [];
    }

    _prepareLineTokens() {
        if (this.activeLineTokens.length === 0 && this.currentLinePointer < this.lineSegments.length) {
            this.activeLineTokens = this.lineSegments[this.currentLinePointer].split(' ');
        }
    }

    extractValue(asString = false) {
        this._prepareLineTokens();
        if (this.activeLineTokens.length === 0) {
            this.currentLinePointer++;
            this._prepareLineTokens();
            if (this.activeLineTokens.length === 0) {
                throw new Error("No more input values available.");
            }
        }
        const extracted = this.activeLineTokens.shift();
        if (this.activeLineTokens.length === 0) {
            this.currentLinePointer++;
        }
        return asString ? extracted : Number(extracted);
    }

    retrieveLine(asString = false) {
        if (this.currentLinePointer >= this.lineSegments.length) {
            throw new Error("No more input lines available.");
        }
        this.activeLineTokens = []; // Clear any partially consumed line tokens
        const lineContent = this.lineSegments[this.currentLinePointer++];
        const tokens = lineContent.split(' ');
        return asString ? tokens : tokens.map(Number);
    }

    retrieveMatrix(count, asString = false) {
        const collectedMatrix = [];
        for (let i = 0; i < count; i++) {
            collectedMatrix.push(this.retrieveLine(asString));
        }
        return collectedMatrix;
    }

    retrieveRaw(count, asString = false) {
        const rawSegments = [];
        for (let i = 0; i < count; i++) {
            if (this.currentLinePointer >= this.lineSegments.length) {
                throw new Error("No more raw input segments available.");
            }
            this.activeLineTokens = []; // Clear any partially consumed line tokens
            const segment = this.lineSegments[this.currentLinePointer++];
            rawSegments.push(asString ? segment : Number(segment));
        }
        return rawSegments;
    }
}

const inputSource = (text) => {
    const processor = new InputProcessor(text);
    return {
        a: (flag) => processor.extractValue(flag),
        l: (flag) => processor.retrieveLine(flag),
        m: (num, flag) => processor.retrieveMatrix(num, flag),
        r: (num, flag) => processor.retrieveRaw(num, flag),
    };
};

class DisjointSetUnion {
    constructor(elementCount) {
        this.parent = Array.from({ length: elementCount }, (_, i) => i);
        this.rank = Array(elementCount).fill(0);
    }

    find(i) {
        if (this.parent[i] === i) {
            return i;
        }
        return this.parent[i] = this.find(this.parent[i]);
    }

    unite(i, j) {
        let rootI = this.find(i);
        let rootJ = this.find(j);

        if (rootI !== rootJ) {
            if (this.rank[rootI] < this.rank[rootJ]) {
                [rootI, rootJ] = [rootJ, rootI];
            }
            this.parent[rootJ] = rootI;
            if (this.rank[rootI] === this.rank[rootJ]) {
                this.rank[rootI]++;
            }
            return true;
        }
        return false;
    }
}

const inputReader = inputSource(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processGrid());

function processGrid() {
    const gridHeight = inputReader.a();
    const gridWidth = inputReader.a();
    const charGrid = inputReader.r(gridHeight, true);

    const totalCells = gridHeight * gridWidth;
    const dsuStructure = new DisjointSetUnion(totalCells);

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            const currentCellId = rowIdx * gridWidth + colIdx;

            if (colIdx + 1 < gridWidth) {
                const rightNeighborId = rowIdx * gridWidth + (colIdx + 1);
                if (charGrid[rowIdx][colIdx] !== charGrid[rowIdx][colIdx + 1]) {
                    dsuStructure.unite(currentCellId, rightNeighborId);
                }
            }

            if (rowIdx + 1 < gridHeight) {
                const bottomNeighborId = (rowIdx + 1) * gridWidth + colIdx;
                if (charGrid[rowIdx][colIdx] !== charGrid[rowIdx + 1][colIdx]) {
                    dsuStructure.unite(currentCellId, bottomNeighborId);
                }
            }
        }
    }

    const componentStatistics = new Map();

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            const currentCellId = rowIdx * gridWidth + colIdx;
            const rootIdentifier = dsuStructure.find(currentCellId);

            if (!componentStatistics.has(rootIdentifier)) {
                componentStatistics.set(rootIdentifier, { dotCount: 0, hashCount: 0 });
            }
            const stats = componentStatistics.get(rootIdentifier);

            if (charGrid[rowIdx][colIdx] === '.') {
                stats.dotCount++;
            } else {
                stats.hashCount++;
            }
        }
    }

    let finalAccumulatedResult = 0;
    for (const stats of componentStatistics.values()) {
        finalAccumulatedResult += stats.dotCount * stats.hashCount;
    }

    return finalAccumulatedResult;
}
