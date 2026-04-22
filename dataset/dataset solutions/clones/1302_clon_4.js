((sourceData) => {
    // Helper function to convert array of strings to array of numbers
    const assimilateNumerics = (stringCollection) => stringCollection.map(x => +x);

    // Helper function for matrix transposition
    const invertDimensions = (initialMatrix) => {
        if (!initialMatrix || initialMatrix.length === 0 || initialMatrix[0].length === 0) {
            return [];
        }
        const width = initialMatrix[0].length;
        const invertedResult = Array.from({ length: width }, (_, colIndex) =>
            initialMatrix.map(row => row[colIndex])
        );
        return invertedResult;
    };

    // Helper function for vector dot product
    const computeComponentProduct = (vectorA, vectorB) => {
        return vectorA.reduce((summation, valueA, position) =>
            summation + (valueA * vectorB[position]), 0);
    };

    // Process input data: flatten all numbers into a single array
    const cleanedInput = sourceData.trim().replace(/\r/g, ''); // Remove carriage returns
    const allNumericStrings = cleanedInput.split(/\s+/).filter(Boolean); // Split by any whitespace, filter empty strings
    const allNumericValues = assimilateNumerics(allNumericStrings);

    // Use a pointer to extract segments from the flattened number array
    let currentPosition = 0;
    const retrieveSegment = (count) => {
        const segment = allNumericValues.slice(currentPosition, currentPosition + count);
        currentPosition += count;
        return segment;
    };

    // Extract matrix dimensions
    const [rowsForMatrixA, commonDimensionValue, columnsForMatrixB] = retrieveSegment(3);

    // Reconstruct Matrix A
    const structureMatrixA = Array.from({ length: rowsForMatrixA }, () =>
        retrieveSegment(commonDimensionValue)
    );

    // Reconstruct Matrix B
    const structureMatrixB = Array.from({ length: commonDimensionValue }, () =>
        retrieveSegment(columnsForMatrixB)
    );

    // Transpose Matrix B
    const transposedStructureMatrixB = invertDimensions(structureMatrixB);

    // Perform matrix multiplication
    const finalStructureResult = structureMatrixA.map(rowVectorA =>
        transposedStructureMatrixB.map(columnVectorB =>
            computeComponentProduct(rowVectorA, columnVectorB)
        )
    );

    // Format output
    const formattedResultText = finalStructureResult.map(resultRow =>
        resultRow.join(' ')
    ).join('\n');

    console.log(formattedResultText);

})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));