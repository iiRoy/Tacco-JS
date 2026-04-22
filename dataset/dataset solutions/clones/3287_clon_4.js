function analyzeGridConnectivity(rawData) {
    const dataLines = rawData.trim().split("\n");
    const [gridHeight, gridWidth] = dataLines[0].split(" ").map(Number);
    const contentRows = dataLines.slice(1);

    const patternConformanceMap = Array.from({ length: gridHeight }, (_, rIdx) =>
        Array.from({ length: gridWidth }, (_, cIdx) => {
            const expectedToken = (rIdx + cIdx) % 2 === 0 ? '#' : '.';
            return contentRows[rIdx][cIdx] === expectedToken ? 1 : 0;
        })
    );

    const traversedCells = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => false)
    );

    const componentParitySummaries = [];

    const isWithinBounds = (r, c) =>
        r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;

    const exploreComponentDepthFirst = (currentRow, currentCol, valueToMatch, currentSummary) => {
        if (!isWithinBounds(currentRow, currentCol) ||
            traversedCells[currentRow][currentCol] ||
            patternConformanceMap[currentRow][currentCol] !== valueToMatch) {
            return;
        }

        traversedCells[currentRow][currentCol] = true;

        if ((currentRow + currentCol) % 2 === 0) {
            currentSummary.evenCount++;
        } else {
            currentSummary.oddCount++;
        }

        const moveDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [deltaR, deltaC] of moveDirections) {
            exploreComponentDepthFirst(currentRow + deltaR, currentCol + deltaC, valueToMatch, currentSummary);
        }
    };

    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            if (!traversedCells[r][c]) {
                const componentSummary = { evenCount: 0, oddCount: 0 };
                exploreComponentDepthFirst(r, c, patternConformanceMap[r][c], componentSummary);
                componentParitySummaries.push(componentSummary);
            }
        }
    }

    let totalProductAccumulator = 0;
    for (const summary of componentParitySummaries) {
        totalProductAccumulator += summary.evenCount * summary.oddCount;
    }

    console.log(totalProductAccumulator);
}

analyzeGridConnectivity(require("fs").readFileSync("/dev/stdin", "utf8"));