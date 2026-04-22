const obtainRawData = (filePath) => require('fs').readFileSync(filePath, 'utf8');

const convertInputToMatrices = (rawText) => {
    const processedLines = rawText.trim().split('\n');
    let currentLineIndex = 0;
    const totalArrangements = parseInt(processedLines[currentLineIndex++], 10);
    const collectedArrangements = [];

    for (let arrangementCounter = 0; arrangementCounter < totalArrangements; arrangementCounter++) {
        const currentMatrixData = [];
        for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
            currentMatrixData.push(processedLines[currentLineIndex++].split(' ').map(Number));
        }
        collectedArrangements.push(currentMatrixData);
    }
    return collectedArrangements;
};

const findRepeatedElementIndices = (sequenceOfValues) => {
    const valueTallies = new Map();
    sequenceOfValues.forEach(element => valueTallies.set(element, (valueTallies.get(element) || 0) + 1));

    const elementsWithMultiples = new Set();
    valueTallies.forEach((tally, element) => {
        if (tally >= 2) {
            elementsWithMultiples.add(element);
        }
    });

    const problematicPositions = [];
    sequenceOfValues.forEach((element, position) => {
        if (elementsWithMultiples.has(element)) {
            problematicPositions.push(position);
        }
    });
    return problematicPositions;
};

const retrieveColumnElements = (matrixContent, columnIdentifier) => matrixContent.map(rowLine => rowLine[columnIdentifier]);

const extractSubgridDetails = (fullMatrix, blockRowIdentifier, blockColIdentifier) => {
    const subgridElementsWithCoordinates = [];
    const initialRow = blockRowIdentifier * 3;
    const initialCol = blockColIdentifier * 3;

    for (let rOffset = 0; rOffset < 3; rOffset++) {
        for (let cOffset = 0; cOffset < 3; cOffset++) {
            const absoluteRow = initialRow + rOffset;
            const absoluteCol = initialCol + cOffset;
            subgridElementsWithCoordinates.push({
                value: fullMatrix[absoluteRow][absoluteCol],
                absoluteRow: absoluteRow,
                absoluteCol: absoluteCol
            });
        }
    }
    return subgridElementsWithCoordinates;
};

const processGridForViolations = (sourceArrangement) => {
    const violationRegistry = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Evaluate rows
    sourceArrangement.forEach((rowContent, rowIdentifier) => {
        const detectedProblemIndices = findRepeatedElementIndices(rowContent);
        detectedProblemIndices.forEach(colIdentifier => violationRegistry[rowIdentifier][colIdentifier]++);
    });

    // Evaluate columns
    for (let c = 0; c < 9; c++) {
        const columnContent = retrieveColumnElements(sourceArrangement, c);
        const detectedProblemIndices = findRepeatedElementIndices(columnContent);
        detectedProblemIndices.forEach(rowIdentifier => violationRegistry[rowIdentifier][c]++);
    }

    // Evaluate 3x3 blocks
    for (let blockR = 0; blockR < 3; blockR++) {
        for (let blockC = 0; blockC < 3; blockC++) {
            const blockDataWithCoords = extractSubgridDetails(sourceArrangement, blockR, blockC);
            const blockValuesOnly = blockDataWithCoords.map(e => e.value);
            const detectedRelativeIndices = findRepeatedElementIndices(blockValuesOnly);

            detectedRelativeIndices.forEach(relativeIndex => {
                const { absoluteRow, absoluteCol } = blockDataWithCoords[relativeIndex];
                violationRegistry[absoluteRow][absoluteCol]++;
            });
        }
    }

    // Generate formatted output string
    return sourceArrangement.map((rowArray, rIndex) => {
        return rowArray.map((cellValue, cIndex) => {
            return (violationRegistry[rIndex][cIndex] >= 1 ? "*" : " ") + cellValue;
        }).join('');
    }).join('\n');
};

// Main execution thread
const entireInputContent = obtainRawData('/dev/stdin');
const parsedGridArrangements = convertInputToMatrices(entireInputContent);
const finalOutputSegments = parsedGridArrangements.map(processGridForViolations);

console.log(finalOutputSegments.join('\n\n').trim());