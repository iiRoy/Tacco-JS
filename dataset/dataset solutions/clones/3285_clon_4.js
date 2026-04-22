const inputProcessor = (function() {
    function createStream(rawInput) {
        let currentLines = rawInput.trim().split('\n');
        let currentLineIndex = 0;

        const getNextToken = (asString = false) => {
            if (currentLines[currentLineIndex] === undefined) {
                return undefined;
            }
            if (!Array.isArray(currentLines[currentLineIndex]) || typeof currentLines[currentLineIndex][0] === 'string') {
                currentLines[currentLineIndex] = String(currentLines[currentLineIndex]).split(' ').reverse();
            }
            let token = currentLines[currentLineIndex].pop();
            if (!currentLines[currentLineIndex].length) {
                currentLineIndex++;
            }
            return asString ? token : Number(token);
        };

        const getLineContents = (asString = false) => {
            if (currentLines[currentLineIndex] === undefined) {
                return undefined;
            }
            let line = currentLines[currentLineIndex];
            currentLineIndex++;
            if (Array.isArray(line)) {
                 line = line.reverse().join(' ');
            }
            let tokens = String(line).split(' ');
            return asString ? tokens : tokens.map(Number);
        };

        const getMultipleLines = (count, asString = false) => {
            const extracted = [];
            for (let i = 0; i < count; i++) {
                if (currentLines[currentLineIndex] === undefined) {
                    break;
                }
                let line = currentLines[currentLineIndex];
                currentLineIndex++;
                if (Array.isArray(line)) {
                    line = line.reverse().join(' ');
                }
                extracted.push(asString ? String(line) : Number(line));
            }
            return extracted;
        };

        const getMultiLineGrid = (count, asString = false) => {
             const extractedRows = [];
             for (let i = 0; i < count; i++) {
                 if (currentLines[currentLineIndex] === undefined) {
                     break;
                 }
                 let line = currentLines[currentLineIndex];
                 currentLineIndex++;
                 if (Array.isArray(line)) {
                     line = line.reverse().join(' ');
                 }
                 const rowTokens = String(line).split(' ');
                 extractedRows.push(asString ? rowTokens : rowTokens.map(Number));
             }
             return extractedRows;
        };

        return {
            extractNext: getNextToken,
            fetchLine: getLineContents,
            retrieveRows: getMultipleLines,
            retrieveMatrix: getMultiLineGrid
        };
    }
    return createStream;
})();

const sourceReader = inputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));

function processGridAnalysis(){
    const gridHeight = sourceReader.extractNext();
    const gridWidth = sourceReader.extractNext();
    const terrainMatrix = sourceReader.retrieveRows(gridHeight, true);

    const parentMap = Array(gridHeight * gridWidth);
    const componentSizes = Array(gridHeight * gridWidth).fill(1);

    for (let currentIdx = 0; currentIdx < gridHeight * gridWidth; currentIdx++) {
        parentMap[currentIdx] = currentIdx;
    }

    const toFlatIndex = (r, c) => r * gridWidth + c;

    const findRoot = (idx) => {
        if (parentMap[idx] === idx) {
            return idx;
        }
        parentMap[idx] = findRoot(parentMap[idx]);
        return parentMap[idx];
    };

    const uniteSets = (idx1, idx2) => {
        let root1 = findRoot(idx1);
        let root2 = findRoot(idx2);

        if (root1 !== root2) {
            if (componentSizes[root1] < componentSizes[root2]) {
                [root1, root2] = [root2, root1];
            }
            parentMap[root2] = root1;
            componentSizes[root1] += componentSizes[root2];
            return true;
        }
        return false;
    };

    const rowOffsets = [-1, 1, 0, 0];
    const colOffsets = [0, 0, -1, 1];

    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const currentCellChar = terrainMatrix[row][col];
            const currentFlatIndex = toFlatIndex(row, col);

            for (let dir = 0; dir < 4; dir++) {
                const neighborRow = row + rowOffsets[dir];
                const neighborCol = col + colOffsets[dir];

                if (neighborRow >= 0 && neighborRow < gridHeight &&
                    neighborCol >= 0 && neighborCol < gridWidth) {

                    const neighborCellChar = terrainMatrix[neighborRow][neighborCol];
                    const neighborFlatIndex = toFlatIndex(neighborRow, neighborCol);

                    if (currentCellChar !== neighborCellChar) {
                        uniteSets(currentFlatIndex, neighborFlatIndex);
                    }
                }
            }
        }
    }

    const componentCharacterCounts = new Map();

    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const currentFlatIndex = toFlatIndex(row, col);
            const componentRoot = findRoot(currentFlatIndex);

            if (!componentCharacterCounts.has(componentRoot)) {
                componentCharacterCounts.set(componentRoot, [0, 0]);
            }

            const counts = componentCharacterCounts.get(componentRoot);
            if (terrainMatrix[row][col] === '.') {
                counts[0]++;
            } else {
                counts[1]++;
            }
        }
    }

    let aggregateSum = 0;
    for (const [root, counts] of componentCharacterCounts.entries()) {
        aggregateSum += counts[0] * counts[1];
    }

    return aggregateSum;
}

console.log(processGridAnalysis());