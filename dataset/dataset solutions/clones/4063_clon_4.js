function produceQuarterTurn(inputMatrix) {
    const transformedMatrix = inputMatrix.map(
        originalRow => [...originalRow]
    );

    const dimension = transformedMatrix.length;

    for (
        let currentRow = 0;
        currentRow < dimension;
        currentRow++
    ) {
        for (
            let currentColumn = currentRow + 1;
            currentColumn < dimension;
            currentColumn++
        ) {
            const temporaryValue =
                transformedMatrix[currentRow][currentColumn];

            transformedMatrix[currentRow][currentColumn] =
                transformedMatrix[currentColumn][currentRow];

            transformedMatrix[currentColumn][currentRow] =
                temporaryValue;
        }
    }

    for (const transformedRow of transformedMatrix) {
        transformedRow.reverse();
    }

    return transformedMatrix;
}