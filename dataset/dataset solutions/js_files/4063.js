function rotateMatrixClockwise(matrix) {
    const size = matrix.length;

    const rotatedMatrix = Array.from(
        { length: size },
        () => new Array(size)
    );

    for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
            const destinationRow = column;
            const destinationColumn = size - 1 - row;

            rotatedMatrix[destinationRow][destinationColumn] =
                matrix[row][column];
        }
    }

    return rotatedMatrix;
}