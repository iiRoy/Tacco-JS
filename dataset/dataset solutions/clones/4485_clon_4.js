const processInputData = (rawTextContent) => {
    // Split the entire input content into individual lines
    const [configurationLine, dataSequenceLine] = rawTextContent.split('\n');

    // Parse numerical parameters from the first line
    const numericParameters = configurationLine.split(' ').map(Number);
    // Extract the index for the final result (K from original 'mem[1]')
    const desiredOutputIndex = numericParameters[1];

    // Process the data sequence: convert to BigInts and apply modulo 2
    const transformedNumericSequence = dataSequenceLine.split(' ').map(elementString => BigInt(Number(elementString) % 2));

    // Define the 2x2 BigInt matrices for the two possible transformations
    const transformForZero = [[2n, 0n], [0n, 2n]];
    const transformForOne = [[1n, 1n], [1n, 1n]];

    // Helper function to multiply two 2x2 matrices
    const combineTwoMatrices = (matrixAlpha, matrixBeta) => {
        const resultingMatrix = [[0n, 0n], [0n, 0n]];
        resultingMatrix[0][0] = matrixAlpha[0][0] * matrixBeta[0][0] + matrixAlpha[0][1] * matrixBeta[1][0];
        resultingMatrix[0][1] = matrixAlpha[0][0] * matrixBeta[0][1] + matrixAlpha[0][1] * matrixBeta[1][1];
        resultingMatrix[1][0] = matrixAlpha[1][0] * matrixBeta[0][0] + matrixAlpha[1][1] * matrixBeta[1][0];
        resultingMatrix[1][1] = matrixAlpha[1][0] * matrixBeta[0][1] + matrixAlpha[1][1] * matrixBeta[1][1];
        return resultingMatrix;
    };

    // The identity matrix, used as the starting point for cumulative matrix multiplication
    const initialTransformationAccumulator = [[1n, 0n], [0n, 1n]];

    // Use `reduce` to compute the single cumulative transformation matrix
    // by sequentially multiplying the individual transformation matrices
    const overallTransformationMatrix = transformedNumericSequence.reduce((currentCombinedMatrix, currentSequenceElement) => {
        const specificOperationMatrix = currentSequenceElement === 0n ? transformForZero : transformForOne;
        return combineTwoMatrices(currentCombinedMatrix, specificOperationMatrix);
    }, initialTransformationAccumulator);

    // The initial state vector (1x2 row vector)
    const initialConditionVector = [1n, 0n];

    // Helper function to apply a 2x2 matrix transformation to a 1x2 vector
    const applyMatrixToVector = (vectorInput, transformationMatrix) => {
        const transformedVector = [0n, 0n];
        transformedVector[0] = vectorInput[0] * transformationMatrix[0][0] + vectorInput[1] * transformationMatrix[1][0];
        transformedVector[1] = vectorInput[0] * transformationMatrix[0][1] + vectorInput[1] * transformationMatrix[1][1];
        return transformedVector;
    };

    // Apply the total transformation matrix to the initial state vector
    const finalStateVector = applyMatrixToVector(initialConditionVector, overallTransformationMatrix);

    // Output the specific element from the final state vector, converted to a string
    console.log(finalStateVector[desiredOutputIndex].toString());
};

// Read input from stdin, trim whitespace, and pass to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());