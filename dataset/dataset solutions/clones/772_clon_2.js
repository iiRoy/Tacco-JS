const horizontal_shifts = {
    NORTH_DIR: 0,
    SOUTH_DIR: 0,
    EAST_DIR: 1,
    WEST_DIR: -1
};

const vertical_shifts = {
    NORTH_DIR: 1,
    SOUTH_DIR: -1,
    EAST_DIR: 0,
    WEST_DIR: 0
};

function ProcessInputData(rawInputText)
{
    let dataLines = rawInputText.split("\n");

    let currentLineIdx = 0;

    while (true)
    {
        let numTargetPoints = Number.parseInt(dataLines[currentLineIdx++], 10);

        if (numTargetPoints === 0)
        {
            break;
        }

        let locationStatusMap = [];
        for (let rowIter = 0; rowIter <= 20; rowIter++)
        {
            locationStatusMap[rowIter] = [];
            for (let colIter = 0; colIter <= 20; colIter++)
            {
                locationStatusMap[rowIter][colIter] = false;
            }
        }
        for (let targetIter = 0; targetIter < numTargetPoints; targetIter++)
        {
            dataLines[currentLineIdx] = dataLines[currentLineIdx].split(" ");
            locationStatusMap[parseInt(dataLines[currentLineIdx][0], 10)][parseInt(dataLines[currentLineIdx++][1], 10)] = true;
        }

        let totalMoves = parseInt(dataLines[currentLineIdx++], 10);

        let directionSequence = [], stepAmountList = [];

        for (let moveIter = 0; moveIter < totalMoves; moveIter++)
        {
            dataLines[currentLineIdx] = dataLines[currentLineIdx].split(" ");
            directionSequence[moveIter] = dataLines[currentLineIdx][0];
            stepAmountList[moveIter] = Number.parseInt(dataLines[currentLineIdx++][1], 10);
        }

        let collectedItemsCount = 0;

        let currentGridX = 10, currentGridY = 10;
        if (locationStatusMap[currentGridX][currentGridY])
        {
            locationStatusMap[currentGridX][currentGridY] = false;
            collectedItemsCount++;
        }

        for (let instrIter = 0; instrIter < totalMoves; instrIter++)
        {
            for (let stepIter = 0; stepIter < stepAmountList[instrIter]; stepIter++)
            {
                currentGridX += horizontal_shifts[directionSequence[instrIter]];
                currentGridY += vertical_shifts[directionSequence[instrIter]];
                if (locationStatusMap[currentGridX][currentGridY])
                {
                    locationStatusMap[currentGridX][currentGridY] = false;
                    collectedItemsCount++;
                }
            }
        }
        if (collectedItemsCount === numTargetPoints)
        {
            console.log("Yes");
        }
        else
        {
            console.log("No");
        }
    }
}
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));