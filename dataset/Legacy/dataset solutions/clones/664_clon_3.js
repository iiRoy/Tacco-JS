const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContents.trim().split("\n");

while (true) {
    let currentLineStr = inputLines.shift();
    if (currentLineStr === "0 0") {
        break;
    }

    const dimensionParts = currentLineStr.split(" ");
    const parsedDimensions = dimensionParts.map(Number);

    const gridDimension = parsedDimensions[0];
    const numOperations = parsedDimensions[1];

    const threeDGrid = [];
    for (let dimX = 0; dimX < gridDimension; dimX++) {
        const rowArray = [];
        for (let dimY = 0; dimY < gridDimension; dimY++) {
            const colArray = [];
            for (let dimZ = 0; dimZ < gridDimension; dimZ++) {
                colArray.push(0);
            }
            rowArray.push(colArray);
        }
        threeDGrid.push(rowArray);
    }

    for (let opIdx = 0; opIdx < numOperations; opIdx++) {
        const operationLine = inputLines.shift();
        const operationParts = operationLine.split(" ");
        const operationAxis = operationParts.shift();
        const rawCoords = operationParts;
        const adjustedCoordinates = rawCoords.map(valStr => parseInt(valStr, 10) - 1);

/*
        if(operationAxis=="xy"){for(let i=0;i<gridDimension;i++)threeDGrid[adjustedCoordinates[0]][adjustedCoordinates[1]][i]=1;}
        else if(operationAxis=="xz"){for(let i=0;i<gridDimension;i++)threeDGrid[adjustedCoordinates[0]][i][adjustedCoordinates[1]]=1;}
        else if(operationAxis=="yz"){for(let i=0;i<gridDimension;i++)threeDGrid[i][adjustedCoordinates[0]][adjustedCoordinates[1]]=1;}
*/
    }

    let totalEmptyCells = 0;
    for (let xPos = 0; xPos < gridDimension; xPos++) {
        for (let yPos = 0; yPos < gridDimension; yPos++) {
            for (let zPos = 0; zPos < gridDimension; zPos++) {
                const currentCellValue = threeDGrid[xPos][yPos][zPos];
                if (currentCellValue === 0) {
                    totalEmptyCells++;
                }
            }
        }
    }
    console.log(totalEmptyCells);
}
