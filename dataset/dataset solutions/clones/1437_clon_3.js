function isValidSudoku(board) {
    if (board.length !== 9) {
        return false;
    }

    const rowValues = Array.from(
        { length: 9 },
        () => new Set()
    );

    const columnValues = Array.from(
        { length: 9 },
        () => new Set()
    );

    const boxValues = Array.from(
        { length: 9 },
        () => new Set()
    );

    for (let row = 0; row < 9; row++) {
        if (board[row].length !== 9) {
            return false;
        }

        for (let column = 0; column < 9; column++) {
            const value = board[row][column];

            if (value === ".") {
                continue;
            }

            const boxIndex =
                Math.floor(row / 3) * 3 +
                Math.floor(column / 3);

            const valueAlreadyExists =
                rowValues[row].has(value) ||
                columnValues[column].has(value) ||
                boxValues[boxIndex].has(value);

            if (valueAlreadyExists) {
                return false;
            }

            rowValues[row].add(value);
            columnValues[column].add(value);
            boxValues[boxIndex].add(value);
        }
    }

    return true;
}