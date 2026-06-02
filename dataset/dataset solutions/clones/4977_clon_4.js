function Main(inputData) {
    const lines = inputData.split("\n");
    const [gridHeight, gridWidth] = lines[0].split(" ").map(Number);

    const activeCells = new Set();

    const centerCounts = new Map();

    const outcomeTally = new Array(10).fill(0);

    if (gridHeight >= 3 && gridWidth >= 3) {
        for (let rIdx = 1; rIdx < gridHeight - 1; rIdx++) {
            for (let cIdx = 1; cIdx < gridWidth - 1; cIdx++) {
                const centerKey = `${rIdx},${cIdx}`;
                centerCounts.set(centerKey, 0);
            }
        }
        outcomeTally[0] = (gridHeight - 2) * (gridWidth - 2);
    } else {
        outcomeTally[0] = (gridHeight - 2) * (gridWidth - 2);
    }

    if (lines.length === 1) {
        console.log(outcomeTally.join("\n"));
        return;
    }

    for (let k = 1; k < lines.length; k++) {
        const [rawRow, rawCol] = lines[k].split(" ").map(Number);
        const markedRow = rawRow - 1;
        const markedCol = rawCol - 1;
        const markedCellKey = `${markedRow},${markedCol}`;

        if (activeCells.has(markedCellKey)) {
            continue;
        }
        activeCells.add(markedCellKey);

        for (let deltaX = -1; deltaX <= 1; deltaX++) {
            for (let deltaY = -1; deltaY <= 1; deltaY++) {
                const potentialCenterX = markedRow - deltaX;
                const potentialCenterY = markedCol - deltaY;
                const centerIdentifier = `${potentialCenterX},${potentialCenterY}`;

                if (
                    potentialCenterX >= 1 && potentialCenterX < gridHeight - 1 &&
                    potentialCenterY >= 1 && potentialCenterY < gridWidth - 1
                ) {
                    const currentCount = centerCounts.get(centerIdentifier);

                    outcomeTally[currentCount]--;

                    centerCounts.set(centerIdentifier, currentCount + 1);

                    outcomeTally[currentCount + 1]++;
                }
            }
        }
    }

    console.log(outcomeTally.join("\n"));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
