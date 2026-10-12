function evaluateGameOutcome(rawData) {
    const inputLines = rawData.split('\n');

    const gameGrid = inputLines.slice(0, 3).map(line => line.split(' '));

    const callCount = Number(inputLines[3]);
    const calledNumbers = new Set(inputLines.slice(4, 4 + callCount));

    const markedCells = gameGrid.map(row =>
        row.map(cellValue => (calledNumbers.has(cellValue) ? 1 : 0))
    );

    const winningPaths = [
        // Horizontal lines
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // Vertical lines
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // Diagonal lines
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
    ];

    const hasWinner = winningPaths.some(path =>
        path.every(([r, c]) => markedCells[r][c] === 1)
    );

    if (hasWinner) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

evaluateGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
