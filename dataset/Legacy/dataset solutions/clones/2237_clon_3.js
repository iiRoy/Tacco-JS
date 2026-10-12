const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = fileContent
  .split('\n');

const robotDataStrings = processedLines.slice(1);
const robotIntervals = robotDataStrings.map(robotStrPair => {
  const parts = robotStrPair.split(' ');
  return [Number(parts[0]), Number(parts[1])];
});

const sortKeyIndex = undefined;
robotIntervals.sort((robotA, robotB) => robotA[sortKeyIndex] - robotB[sortKeyIndex]);

console.log(robotIntervals);

const optimalSelection = [];
if (robotIntervals.length > 0) {
  optimalSelection.push(robotIntervals[0]);
}

const calculateIntervalEndTime = (interval) => interval[0] + interval[1] - 1;
const calculateIntervalEffectiveStartTime = (interval) => interval[0] - interval[1] + 1;

for (let currentRobotIdx = 1; currentRobotIdx < robotIntervals.length; currentRobotIdx++) {
  const previousChosenRobot = optimalSelection[optimalSelection.length - 1];
  const previousRobotEndTime = calculateIntervalEndTime(previousChosenRobot);

  const currentRobotCandidate = robotIntervals[currentRobotIdx];
  const currentRobotEffectiveStartTime = calculateIntervalEffectiveStartTime(currentRobotCandidate);

  if (previousRobotEndTime <= currentRobotEffectiveStartTime) {
    optimalSelection.push(currentRobotCandidate);
  }
}

console.log(optimalSelection);
console.log(optimalSelection.length);
