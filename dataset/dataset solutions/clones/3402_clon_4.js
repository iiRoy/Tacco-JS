class InputSource {
    constructor(sourceText) {
        this.dataLines = sourceText.trim().split('\n');
        this.currentLineIdx = 0;
        this.currentLineTokens = [];
        this.currentTokenIdx = 0;
    }

    _prepareCurrentLine() {
        while (this.currentTokenIdx >= this.currentLineTokens.length) {
            if (this.currentLineIdx < this.dataLines.length) {
                const line = this.dataLines[this.currentLineIdx++];
                this.currentLineTokens = line.trim().split(/\s+/).filter(Boolean);
                this.currentTokenIdx = 0;
            } else {
                this.currentLineTokens = [];
                this.currentTokenIdx = 0;
                break;
            }
        }
    }

    pullDatum(asString = false) {
        this._prepareCurrentLine();
        if (this.currentTokenIdx < this.currentLineTokens.length) {
            const val = this.currentLineTokens[this.currentTokenIdx++];
            return asString ? val : +val;
        }
        return asString ? '' : NaN;
    }

    pullLine(asString = false) {
        if (this.currentLineIdx < this.dataLines.length) {
            const line = this.dataLines[this.currentLineIdx++];
            const tokens = line.trim().split(/\s+/).filter(Boolean);
            this.currentLineTokens = [];
            this.currentTokenIdx = 0;
            return asString ? tokens : tokens.map(Number);
        }
        return asString ? [] : [];
    }

    pullMatrix(count, asString = false) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.pullLine(asString));
        }
        return result;
    }

    pullRows(count, asString = false) {
        const result = [];
        for (let i = 0; i < count; i++) {
            const line = this.pullLine(asString);
            result.push(...line);
        }
        return result;
    }
}

const dataAccessor = (function() {
    let instance = null;
    return (inputContent) => {
        if (!instance) {
            instance = new InputSource(inputContent);
        }
        return instance;
    };
})();

function computePathWidth() {
    const reader = dataAccessor();

    const verticalExtent = reader.pullDatum();
    const horizontalExtent = reader.pullDatum();
    const obstacleCount = reader.pullDatum();

    const blockageRegistry = new Map();

    for (let k = 0; k < obstacleCount; k++) {
        const blockCoordinates = reader.pullLine();
        const obsCol = blockCoordinates[0];
        const obsRow = blockCoordinates[1];

        if (obsCol < obsRow) continue;

        if (!blockageRegistry.has(obsRow)) {
            blockageRegistry.set(obsRow, new Set());
        }
        blockageRegistry.get(obsRow).add(obsCol);
    }

    for (let r = 1; r <= verticalExtent; r++) {
        if (!blockageRegistry.has(r)) {
            blockageRegistry.set(r, new Set());
        }
        blockageRegistry.get(r).add(horizontalExtent + 1);
    }

    let initialWidth = horizontalExtent;
    if (blockageRegistry.has(1)) {
        const row1Obstacles = Array.from(blockageRegistry.get(1)).sort((a, b) => a - b);
        if (row1Obstacles.length > 0) {
            initialWidth = row1Obstacles[0] - 1;
        }
    }

    const finalResult = Array.from({ length: verticalExtent - 1 }, (_, i) => i + 2)
        .reduce((accumulator, currentRow) => {
            let [currentMinEffectiveWidth, currentPathLeftmostColumn] = accumulator;

            if (currentRow > currentMinEffectiveWidth) {
                return [currentMinEffectiveWidth, currentPathLeftmostColumn];
            }
            if (currentPathLeftmostColumn >= horizontalExtent) {
                return [currentMinEffectiveWidth, currentPathLeftmostColumn];
            }

            const obstaclesInCurrentRow = blockageRegistry.get(currentRow) || new Set();
            while (obstaclesInCurrentRow.has(currentPathLeftmostColumn)) {
                currentPathLeftmostColumn++;
            }

            let nextRelevantObstacleCol = Infinity;
            const sortedObstacles = Array.from(obstaclesInCurrentRow).sort((a, b) => a - b);
            for (const obsCol of sortedObstacles) {
                if (obsCol >= currentPathLeftmostColumn) {
                    nextRelevantObstacleCol = obsCol;
                    break;
                }
            }

            if (nextRelevantObstacleCol !== Infinity) {
                currentMinEffectiveWidth = Math.min(currentMinEffectiveWidth, nextRelevantObstacleCol - 1);
            }

            currentPathLeftmostColumn++;

            return [currentMinEffectiveWidth, currentPathLeftmostColumn];
        }, [initialWidth, 2]);

    return finalResult[0];
}

const sourceInputContent = require("fs").readFileSync("/dev/stdin","utf8");
dataAccessor(sourceInputContent);
console.log(computePathWidth());