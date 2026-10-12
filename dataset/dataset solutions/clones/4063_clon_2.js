function turnGridToTheRight(sourceGrid) {
    const dimension = sourceGrid.length;

    const transformedGrid = Array.from(
        { length: dimension },
        () => new Array(dimension)
    );

    for (
        let sourceRow = 0;
        sourceRow < dimension;
        sourceRow++
    ) {
        for (
            let sourceColumn = 0;
            sourceColumn < dimension;
            sourceColumn++
        ) {
            const targetRow = sourceColumn;
            const targetColumn =
                dimension - 1 - sourceRow;

            transformedGrid[targetRow][targetColumn] =
                sourceGrid[sourceRow][sourceColumn];
        }
    }

    return transformedGrid;
}