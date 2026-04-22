function gameProcessor(fullInput) {
    const contentLines = fullInput.trim().split('\n');

    const boardNumbers = contentLines.slice(0, 3).map(lineText => lineText.split(' '));
    const announcedCountValue = parseInt(contentLines[3], 10);
    const calledNumbersSet = new Set(contentLines.slice(4, 4 + announcedCountValue));

    const markedStatusGrid = boardNumbers.map(rowNumbers =>
        rowNumbers.map(numStr => calledNumbersSet.has(numStr) ? 1 : 0)
    );

    const checkLineCompletion = (line) => line.every(cellState => cellState === 1);

    const isRowBingo = markedStatusGrid.some(checkLineCompletion);

    if (isRowBingo) {
        console.log('Yes');
        return;
    }

    const transposedGrid = markedStatusGrid[0].map((_, colIndex) =>
        markedStatusGrid.map(row => row[colIndex])
    );

    const isColumnBingo = transposedGrid.some(checkLineCompletion);

    if (isColumnBingo) {
        console.log('Yes');
        return;
    }

    // The original code's logic for checking diagonals was flawed and would
    // never correctly detect a diagonal bingo. To ensure "exactly the same results"
    // and replicate its effective functionality, a working diagonal check is omitted here.

    console.log('No');
}

gameProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));