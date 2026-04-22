const someInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const numericalInputs = [];

someInterface.on('line', (lineContent) => {
    numericalInputs.push(Number(lineContent.trim()));
});

someInterface.on('close', () => {
    numericalInputs.forEach( (gridDimension) => {
        if (gridDimension === 0) {
            return;
        }

        const gridStructure = Array.from({ length: gridDimension }, () => Array(gridDimension).fill(-1));

        let currentNumericalValue = 1;
        let lastSuccessfulRow = Math.floor(gridDimension / 2) + 1;
        let lastSuccessfulCol = Math.floor(gridDimension / 2);

        lastSuccessfulRow = (lastSuccessfulRow % gridDimension + gridDimension) % gridDimension;
        lastSuccessfulCol = (lastSuccessfulCol % gridDimension + gridDimension) % gridDimension;
        
        gridStructure[lastSuccessfulRow][lastSuccessfulCol] = currentNumericalValue;
        currentNumericalValue++;

        let nextProposedRow = lastSuccessfulRow + 1;
        let nextProposedCol = lastSuccessfulCol + 1;

        while (currentNumericalValue <= gridDimension * gridDimension) {
            nextProposedRow = (nextProposedRow % gridDimension + gridDimension) % gridDimension;
            nextProposedCol = (nextProposedCol % gridDimension + gridDimension) % gridDimension;

            if (gridStructure[nextProposedRow][nextProposedCol] !== -1) {
                nextProposedRow = nextProposedRow + 1;
                nextProposedCol = nextProposedCol - 1;
            } else {
                gridStructure[nextProposedRow][nextProposedCol] = currentNumericalValue;
                currentNumericalValue++;
                nextProposedRow = nextProposedRow + 1;
                nextProposedCol = nextProposedCol + 1;
            }
        }
        
        const generatedLines = gridStructure.map(line => line.join(" "));
        console.log(generatedLines.join("\n"));
    });
});