const processInputData = (rawData) => {
    const inputParts = rawData.split(" ");

    const distanceValue = parseFloat(inputParts[0]);
    const allowedTime = parseFloat(inputParts[1]);
    const travelSpeed = parseFloat(inputParts[2]);

    const calculatedTimeNeeded = distanceValue / travelSpeed;

    let isPossibleToReach;
    if (allowedTime >= calculatedTimeNeeded) {
        isPossibleToReach = true;
    } else {
        isPossibleToReach = false;
    }

    console.log(isPossibleToReach ? "Yes" : "No");
};

const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInputData(standardInputContent);
