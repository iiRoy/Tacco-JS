function parseNumericArray(stringArray) {
    const parsedNumbers = [];
    for (let element of stringArray) {
        parsedNumbers.push(parseInt(element, 10));
    }
    return parsedNumbers;
}

function determineBounceCount(maximumDistance, distancesArray) {
    const startingBounces = 1;
    let currentAccumulatedDistance = 0;
    let totalBouncesAchieved = startingBounces;

    for (let segmentIndex = 0; segmentIndex < distancesArray.length; segmentIndex++) {
        currentAccumulatedDistance += distancesArray[segmentIndex];
        if (currentAccumulatedDistance <= maximumDistance) {
            totalBouncesAchieved++;
        } else {
            break;
        }
    }
    return totalBouncesAchieved;
}

function ProcessInputData(rawInputContent) {
    const splitInputData = rawInputContent.trim().split(/\n|\s/);

    // The first value (N) is parsed but not used in the original logic,
    // so we maintain that behavior.
    const initialCountValue = parseInt(splitInputData[0], 10);
    const limitValue = parseInt(splitInputData[1], 10);

    const distanceSegments = parseNumericArray(splitInputData.slice(2));

    const finalResult = determineBounceCount(limitValue, distanceSegments);

    console.log(finalResult);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const inputFromFile = fileSystemModule.readFileSync(standardInputPath, encodingType);
ProcessInputData(inputFromFile);
