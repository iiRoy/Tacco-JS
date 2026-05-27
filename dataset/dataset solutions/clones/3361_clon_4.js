function processInput(inputString) {
    const dataLines = inputString.split('\n');
    const [segmentLength, itemCount] = dataLines[0].split(' ').map(Number);
    const itemPositions = dataLines.slice(1).map(Number);

    let currentRobotPosition = 0;
    let totalTravelledDistance = 0;
    let leftBoundaryIndex = 0;
    let rightBoundaryIndex = itemPositions.length - 1;

    let operationCounter = 0;
    while (operationCounter < itemCount) {
        const firstAvailableItem = itemPositions[leftBoundaryIndex];
        const lastAvailableItem = itemPositions[rightBoundaryIndex];

        const distanceToFirst = firstAvailableItem - currentRobotPosition;
        const distanceToLastWrapped = (segmentLength - lastAvailableItem) + currentRobotPosition;

        console.log("now:" + currentRobotPosition);
        console.log("total:" + totalTravelledDistance);

        if (distanceToFirst > distanceToLastWrapped) {
            totalTravelledDistance += distanceToFirst;
            leftBoundaryIndex++;
            currentRobotPosition = firstAvailableItem;
        } else {
            totalTravelledDistance += distanceToLastWrapped;
            rightBoundaryIndex--;
            currentRobotPosition = lastAvailableItem;
        }
        operationCounter++;
    }

    console.log(totalTravelledDistance);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
