const START_COORD_INDEX = 0;
const END_COORD_INDEX = 1;
const ROBOT_X_COORD_INDEX = 0;
const ROBOT_R_COORD_INDEX = 1;

function calculateRobotInterval(robotCoords) {
    const xPosition = robotCoords[ROBOT_X_COORD_INDEX];
    const radius = robotCoords[ROBOT_R_COORD_INDEX];
    const intervalStart = xPosition - radius;
    const intervalEnd = xPosition + radius;
    return [intervalStart, intervalEnd];
}

function retrieveLastElement(collection) {
    if (collection.length === 0) {
        return undefined;
    }
    const lastIndex = collection.length - 1;
    return collection[lastIndex];
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const trimmedInputContent = rawInputData.trim();
const inputLineArray = trimmedInputContent.split('\n');

const dataLinesExcludingHeader = inputLineArray.slice(1);

const allRobotIntervals = dataLinesExcludingHeader
    .map(lineString => lineString.split(' ').map(Number))
    .map(calculateRobotInterval);

allRobotIntervals.sort((intervalA, intervalB) => {
    const endPointA = intervalA[END_COORD_INDEX];
    const endPointB = intervalB[END_COORD_INDEX];
    return endPointA - endPointB;
});

const initialSelectionIndex = 0;
const optimalRobotSet = [allRobotIntervals[initialSelectionIndex]];

for (let currentRobotIdx = 1; currentRobotIdx < allRobotIntervals.length; currentRobotIdx++) {
    const lastOptimalRobot = retrieveLastElement(optimalRobotSet);
    const lastOptimalRobotEnd = lastOptimalRobot[END_COORD_INDEX];

    const candidateRobotInterval = allRobotIntervals[currentRobotIdx];
    const candidateRobotStart = candidateRobotInterval[START_COORD_INDEX];

    const canAddCandidate = lastOptimalRobotEnd <= candidateRobotStart;

    if (canAddCandidate) {
        optimalRobotSet.push(candidateRobotInterval);
    }
}

console.log(optimalRobotSet.length);
