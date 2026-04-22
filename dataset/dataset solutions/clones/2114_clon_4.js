const processGameData = (gameInputLines) => {
    const cardRows = gameInputLines.slice(0, 3).map(line =>
        line.split(" ").map(Number)
    );
    const numericCalls = gameInputLines.slice(3).map(line =>
        Number(line.split(" ")[0])
    );

    const applyMark = (currentGrid, callValue) => {
        return currentGrid.map(row =>
            row.map(cellValue => (cellValue === callValue ? null : cellValue))
        );
    };

    const finalGrid = numericCalls.reduce(applyMark, cardRows);

    const winningPaths = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
    ];

    const hasBingo = winningPaths.some(path =>
        path.every(([rowIndex, colIndex]) => finalGrid[rowIndex][colIndex] === null)
    );

    console.log(hasBingo ? 'Yes' : 'No');
};

processGameData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));