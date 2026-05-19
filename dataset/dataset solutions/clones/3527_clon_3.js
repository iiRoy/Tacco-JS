const parseInteger = (strVal) => parseInt(strVal, 10);

function processInputData(rawData) {
    const allInputLines = rawData.split("\n");

    const firstLineValues = allInputLines[0].split(" ");
    const countN = parseInteger(firstLineValues[0]);
    const countM = parseInteger(firstLineValues[1]);
    const initialXCoordinate = parseInteger(firstLineValues[2]);
    const initialYCoordinate = parseInteger(firstLineValues[3]);

    const xCoordinatesStringArray = allInputLines[1].split(" ");
    const yCoordinatesStringArray = allInputLines[2].split(" ");

    let currentMaximumX = initialXCoordinate;
    let currentMinimumY = initialYCoordinate;

    for (const xCoordStr of xCoordinatesStringArray) {
        const parsedXCoord = parseInteger(xCoordStr);
        if (parsedXCoord > currentMaximumX) {
            currentMaximumX = parsedXCoord;
        }
    }

    for (const yCoordStr of yCoordinatesStringArray) {
        const parsedYCoord = parseInteger(yCoordStr);
        if (parsedYCoord < currentMinimumY) {
            currentMinimumY = parsedYCoord;
        }
    }

    const determineWarStatus = (minYValue, maxXValue) => {
        if (minYValue <= maxXValue) {
            return 'War';
        } else {
            return 'No War';
        }
    };

    console.log(determineWarStatus(currentMinimumY, currentMaximumX));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
