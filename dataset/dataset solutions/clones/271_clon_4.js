const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputNumbers = rawInput.trim().split("\n").map(Number);

for (let inputIndex = 0; inputIndex < inputNumbers.length; inputIndex++) {
    const dimension = inputNumbers[inputIndex];

    if (dimension === 0) {
        break;
    }

    const totalCells = dimension * dimension;
    const magicMatrix = Array.from({ length: dimension }, () => Array(dimension).fill(-1));

    const initialColumn = Math.floor(dimension / 2);
    const initialRow = initialColumn + 1;

    magicMatrix[initialRow][initialColumn] = 1;

    let currentNumber = 2;
    let lastRawRow = initialRow;
    let lastRawCol = initialColumn;

    while (currentNumber <= totalCells) {
        const nextRawRowDiagonal = lastRawRow + 1;
        const nextRawColDiagonal = lastRawCol + 1;

        const wrappedRowDiagonal = (nextRawRowDiagonal < 0) ? dimension - 1 : (nextRawRowDiagonal >= dimension) ? 0 : nextRawRowDiagonal;
        const wrappedColDiagonal = (nextRawColDiagonal < 0) ? dimension - 1 : (nextRawColDiagonal >= dimension) ? 0 : nextRawColDiagonal;

        if (magicMatrix[wrappedRowDiagonal][wrappedColDiagonal] !== -1) {
            const nextRawRowAlternative = lastRawRow + 1;
            const nextRawColAlternative = lastRawCol - 1;

            const wrappedRowAlternative = (nextRawRowAlternative < 0) ? dimension - 1 : (nextRawRowAlternative >= dimension) ? 0 : nextRawRowAlternative;
            const wrappedColAlternative = (nextRawColAlternative < 0) ? dimension - 1 : (nextRawColAlternative >= dimension) ? 0 : nextRawColAlternative;

            magicMatrix[wrappedRowAlternative][wrappedColAlternative] = currentNumber;
            lastRawRow = nextRawRowAlternative;
            lastRawCol = nextRawColAlternative;
        } else {
            magicMatrix[wrappedRowDiagonal][wrappedColDiagonal] = currentNumber;
            lastRawRow = nextRawRowDiagonal;
            lastRawCol = nextRawColDiagonal;
        }
        currentNumber++;
    }

    const formattedRows = magicMatrix.map(row => " " + row.join(" "));
    console.log(formattedRows.join("\n"));
}
