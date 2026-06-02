function solveProblem(inputLines) {
  const rawNumbers = inputLines[0].split(" ");
  const headCount = parseInt(rawNumbers[0], 10);
  const legCount = parseInt(rawNumbers[1], 10);

  let solutionFound = false;

  const TURTLE_LEGS_COUNT = 4;
  const CRANE_LEGS_COUNT = 2;

  for (let currentTurtleCount = 0; currentTurtleCount <= headCount; currentTurtleCount++) {
    const currentCraneCount = headCount - currentTurtleCount;

    const totalLegsFromTurtles = currentTurtleCount * TURTLE_LEGS_COUNT;
    const totalLegsFromCranes = currentCraneCount * CRANE_LEGS_COUNT;
    const combinedLegs = totalLegsFromTurtles + totalLegsFromCranes;

    if (combinedLegs === legCount) {
      solutionFound = true;
      break;
    }
  }

  if (solutionFound) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInput = fileContent.trim().split('\n');
solveProblem(processedInput);
