const readline = require('readline');

(async () => {
    const rlInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    const inputLines = [];
    for await (const currentLine of rlInterface) {
        inputLines.push(currentLine);
    }

    const [gridHeight, gridWidth, numTargets] = inputLines[0].split(/\s/).map(Number);

    const targetLocations = inputLines.slice(1, numTargets + 1).map(line =>
        line.split(/\s/).map(val => Number(val) - 1)
    );

    const rowTallies = new Map();
    const columnTallies = new Map();
    const occupiedCells = new Set(); // Stores "r,c" strings for quick lookup

    targetLocations.forEach(coordPair => {
        const [r, c] = coordPair;
        rowTallies.set(r, (rowTallies.get(r) || 0) + 1);
        columnTallies.set(c, (columnTallies.get(c) || 0) + 1);
        occupiedCells.add(`${r},${c}`);
    });

    let peakRowHits = 0;
    if (rowTallies.size > 0) {
        peakRowHits = Math.max(...rowTallies.values());
    }

    let peakColHits = 0;
    if (columnTallies.size > 0) {
        peakColHits = Math.max(...columnTallies.values());
    }

    const candidateRows = Array.from({ length: gridHeight }, (_, rIdx) => rIdx)
        .filter(rIdx => (rowTallies.get(rIdx) || 0) === peakRowHits);

    const candidateCols = Array.from({ length: gridWidth }, (_, cIdx) => cIdx)
        .filter(cIdx => (columnTallies.get(cIdx) || 0) === peakColHits);

    const allIntersectionsOccupied = candidateRows.every(r =>
        candidateCols.every(c => occupiedCells.has(`${r},${c}`))
    );

    const overlapPenalty = allIntersectionsOccupied ? 1 : 0;

    console.log(peakRowHits + peakColHits - overlapPenalty);
})();
