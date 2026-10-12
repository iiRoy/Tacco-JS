function Main(inputData) {
    const [widthStr, heightStr, pointXStr, pointYStr] = inputData.split(" ");
    const rectWidth = Number(widthStr);
    const rectHeight = Number(heightStr);
    const pointX = Number(pointXStr);
    const pointY = Number(pointYStr);

    let minPartitionArea = 0;
    let maxPartitionArea = 0;
    let numWaysForMaxArea = 0;

    const totalArea = rectWidth * rectHeight;
    const halfArea = totalArea / 2;

    const halfWidth = rectWidth / 2;
    const halfHeight = rectHeight / 2;

    if (pointX === halfWidth && pointY === halfHeight) {
        maxPartitionArea = halfArea;
        numWaysForMaxArea = 1;
    } else if (pointX === rectWidth || pointY === rectHeight || pointX === halfWidth || pointY === halfHeight) {
        maxPartitionArea = halfArea;
    } else if ((pointX / pointY) === (rectWidth / rectHeight) || ((pointX / pointY) * pointX + pointY) === rectHeight) {
        maxPartitionArea = halfArea;
        numWaysForMaxArea = 1;
    } else {
        let boundaryXCoord = (pointY / pointX) * rectHeight;
        let boundaryYCoord = (pointX / pointY) * rectWidth;
        let auxiliaryAreaComponent = 0;

        if (boundaryXCoord < rectWidth) {
            auxiliaryAreaComponent = (pointX - boundaryXCoord) * (rectHeight - pointY);
        } else if (boundaryYCoord < rectHeight) {
            auxiliaryAreaComponent = (rectWidth - pointX) * (pointY - boundaryYCoord);
        }

        const calculatedAreaOne = (rectWidth - pointX) * (rectHeight - pointY) / 2 + (pointX * pointY) + auxiliaryAreaComponent;
        const calculatedAreaTwo = totalArea - calculatedAreaOne;

        if (calculatedAreaOne > calculatedAreaTwo) {
            maxPartitionArea = calculatedAreaOne;
        } else {
            maxPartitionArea = calculatedAreaTwo;
        }
    }

    minPartitionArea = totalArea - maxPartitionArea;
    
    console.log(minPartitionArea + ' ' + numWaysForMaxArea);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
