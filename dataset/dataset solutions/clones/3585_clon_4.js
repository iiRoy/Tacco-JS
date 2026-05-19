function main(inputString) {
    const inputLines = inputString.trim().split("\n");
    const [initialGridHeight, initialGridWidth] = inputLines[0].split(" ").map(Number);
    const rawGridRows = inputLines.slice(1);

    const characterMatrix = rawGridRows.map(rowText => rowText.split(''));

    const getTransposedMatrix = (matrixToTranspose) => {
        if (matrixToTranspose.length === 0 || matrixToTranspose[0].length === 0) {
            return [];
        }
        const rowCount = matrixToTranspose.length;
        const colCount = matrixToTranspose[0].length;
        const transposedResult = Array.from({ length: colCount }, () => Array(rowCount).fill(null));
        for (let rIdx = 0; rIdx < rowCount; rIdx++) {
            for (let cIdx = 0; cIdx < colCount; cIdx++) {
                transposedResult[cIdx][rIdx] = matrixToTranspose[rIdx][cIdx];
            }
        }
        return transposedResult;
    };

    const hasHashCharacter = (lineSegment) => lineSegment.some(charElement => charElement === '#');

    const rowsWithoutEmpty = characterMatrix.filter(hasHashCharacter);

    const columnsAsRows = getTransposedMatrix(rowsWithoutEmpty);

    const columnsWithoutEmpty = columnsAsRows.filter(hasHashCharacter);

    const finalProcessedMatrix = getTransposedMatrix(columnsWithoutEmpty);

    if (finalProcessedMatrix.length === 1) {
        const singleResultRow = finalProcessedMatrix[0];
        const hashOnlyCharacters = singleResultRow.filter(charItem => charItem === '#');
        console.log(hashOnlyCharacters.join(''));
    } else {
        const stringifiedRows = finalProcessedMatrix.map(rowArray => rowArray.join(''));
        console.log(stringifiedRows.join('\n'));
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
