const calculateDelta = (pieceAlpha, pieceBeta, pieceGamma) => {
    return Math.max(pieceAlpha, pieceBeta, pieceGamma) - Math.min(pieceAlpha, pieceBeta, pieceGamma);
};

const evaluateConfiguration = (extentA, extentB) => {
    const possibleCutPoints = Array.from({ length: extentA - 1 }, (_, index) => index + 1);

    const allDifferences = possibleCutPoints.flatMap(cutCoordinate => {
        const totalDimensionProduct = extentA * extentB;

        // Configuration 1: Main strip cut along extentA, remaining split along extentB
        const sectionOne_A = cutCoordinate * extentB;
        const remainingExtentA_A = extentA - cutCoordinate;
        const sectionTwo_A = remainingExtentA_A * (extentB / 2);
        const sectionThree_A = totalDimensionProduct - (sectionOne_A + sectionTwo_A);

        // Configuration 2: Main strip cut along extentA, remaining split along extentA
        const sectionOne_B = cutCoordinate * extentB;
        const remainingExtentA_B = extentA - cutCoordinate;
        const sectionTwo_B = (remainingExtentA_B / 2) * extentB;
        const sectionThree_B = totalDimensionProduct - (sectionOne_B + sectionTwo_B);

        return [
            calculateDelta(sectionOne_A, sectionTwo_A, sectionThree_A),
            calculateDelta(sectionOne_B, sectionTwo_B, sectionThree_B)
        ];
    });
    
    return Math.min(...allDifferences);
};

const problemSolver = (sourceText) => {
    const inputFigures = sourceText.trim().split('\n')[0].split(' ').map(Number);
    const primaryFigure = inputFigures[0];
    const secondaryFigure = inputFigures[1];

    const outcomeForBaseOrientation = evaluateConfiguration(primaryFigure, secondaryFigure);
    const outcomeForFlippedOrientation = evaluateConfiguration(secondaryFigure, primaryFigure);

    return Math.min(outcomeForBaseOrientation, outcomeForFlippedOrientation);
};

console.log(problemSolver(require('fs').readFileSync('/dev/stdin', 'utf8')));