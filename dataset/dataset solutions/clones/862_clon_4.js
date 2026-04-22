const outputLog = console.log;

const fetchInputData = () => {
    const rawContent = require("fs").readFileSync(0, "utf-8");
    return rawContent.split("\n").filter(line => line.length > 0);
};

const parseStringLineIntoNumbers = (textLine, delimiter = " ") => {
    return textLine.split(delimiter).map(value => Number(value));
};

const calculateGridCellDistance = (firstPointCoordinate, secondPointCoordinate, gridColumns) => {
    const firstPointRow = Math.floor(firstPointCoordinate / gridColumns);
    const firstPointCol = firstPointCoordinate % gridColumns;
    const secondPointRow = Math.floor(secondPointCoordinate / gridColumns);
    const secondPointCol = secondPointCoordinate % gridColumns;

    return Math.abs(firstPointRow - secondPointRow) + Math.abs(firstPointCol - secondPointCol);
};

(function runApplication() {
    const inputRecords = fetchInputData();

    const dimensionLimit = Number(inputRecords[0]);
    
    const firstPointPair = parseStringLineIntoNumbers(inputRecords[1]);
    const pointOneIndex = firstPointPair[0] - 1;
    const pointTwoIndex = firstPointPair[1] - 1;

    const secondPointPair = parseStringLineIntoNumbers(inputRecords[2]);
    const pointThreeIndex = secondPointPair[0] - 1;
    const pointFourIndex = secondPointPair[1] - 1;

    const possibleLayoutWidths = Array.from({ length: dimensionLimit - 1 }, (_, index) => index + 1);

    const overallMinimum = possibleLayoutWidths.reduce((currentMinDistance, currentLayoutWidth) => {
        const distanceBetweenFirstPoints = calculateGridCellDistance(pointOneIndex, pointTwoIndex, currentLayoutWidth);
        const distanceBetweenSecondPoints = calculateGridCellDistance(pointThreeIndex, pointFourIndex, currentLayoutWidth);
        const currentCombinedDistance = distanceBetweenFirstPoints + distanceBetweenSecondPoints;
        
        return Math.min(currentMinDistance, currentCombinedDistance);
    }, dimensionLimit * dimensionLimit);

    outputLog(overallMinimum);
})();