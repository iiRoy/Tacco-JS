const fileUtilities = require('fs');

class InputProcessor {
    constructor(sourcePath) {
        this.allLines = fileUtilities.readFileSync(sourcePath, 'utf8').trim().split('\n');
        this.currentPointer = 0;
    }

    retrieveNextTokenizedLine() {
        if (this.currentPointer >= this.allLines.length) {
            return null; // Signals end of input stream
        }
        const lineContent = this.allLines[this.currentPointer];
        this.currentPointer++;
        return lineContent.split(' ').map(val => parseInt(val, 10));
    }
}

const questionnaireStream = new InputProcessor('/dev/stdin');
const collectedResults = [];

let currentProblemDimensions;
while ((currentProblemDimensions = questionnaireStream.retrieveNextTokenizedLine()) !== null) {
    const matrixRows = currentProblemDimensions[0];
    const matrixColumns = currentProblemDimensions[1];

    if (matrixRows === 0 && matrixColumns === 0) {
        break; // End condition for the entire dataset
    }

    const aggregatedScores = new Map(); // Stores column totals

    // Iterate through each row of the current matrix
    Array.from({ length: matrixRows }).forEach(() => {
        const rowOfNumbers = questionnaireStream.retrieveNextTokenizedLine();
        // Iterate through each column in the current row
        Array.from({ length: matrixColumns }).forEach((_, colIndex) => {
            const oneBasedColumnId = colIndex + 1;
            const scoreForCell = rowOfNumbers[colIndex];
            
            // Update the total for the current column
            aggregatedScores.set(
                oneBasedColumnId,
                (aggregatedScores.get(oneBasedColumnId) || 0) + scoreForCell
            );
        });
    });

    // Transform Map entries into an array of objects for easier sorting
    const sortedColumnData = Array.from(aggregatedScores.entries()).map(([identifier, totalValue]) => ({
        columnIdentifier: identifier,
        overallScore: totalValue
    }));

    // Apply custom sorting logic
    sortedColumnData.sort((firstElement, secondElement) => {
        if (firstElement.overallScore === secondElement.overallScore) {
            return firstElement.columnIdentifier - secondElement.columnIdentifier; // Secondary sort: ascending by column ID
        }
        return secondElement.overallScore - firstElement.overallScore; // Primary sort: descending by overall score
    });

    // Extract just the column identifiers and format for output
    const formattedOutputLine = sortedColumnData.map(item => item.columnIdentifier).join(' ');
    collectedResults.push(formattedOutputLine);
}

// Print all accumulated results
collectedResults.forEach(outputLine => console.log(outputLine));