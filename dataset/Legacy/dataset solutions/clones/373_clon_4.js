function rotateGrid(sourceMatrix) {
    const matrixSize = 8;
    return Array.from({ length: matrixSize }, (_, newRowIdx) =>
        Array.from({ length: matrixSize }, (_, newColIdx) =>
            sourceMatrix[matrixSize - 1 - newColIdx][newRowIdx]
        )
    );
}

const fileSystemModule = require('fs');
const rawContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const contentLines = rawContent.trim().split("\n");

let currentMatrix = contentLines.slice(0, 8).map(line => line.split(''));

const rotationIdentifiers = ["90", "180", "270"];

for (const identifier of rotationIdentifiers) {
    currentMatrix = rotateGrid(currentMatrix);
    console.log(`${identifier}\n${currentMatrix.join('\n')}`);
}
