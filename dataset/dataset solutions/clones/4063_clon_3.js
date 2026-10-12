function rotateMatrixClockwise(matrix) {
    if (matrix.length === 0) {
        return [];
    }

    const size = matrix.length;
    const rotatedMatrix = [];

    for (let column = 0; column < size; column++) {
        const rotatedRow = new Array(size);

        for (let row = size - 1; row >= 0; row--) {
            const destinationColumn =
                size - 1 - row;

            rotatedRow[destinationColumn] =
                matrix[row][column];
        }

        rotatedMatrix.push(rotatedRow);
    }

    return rotatedMatrix;
}