const fileSystem = require("fs");

const contentBuffer = fileSystem.readFileSync("/dev/stdin", "utf8");
const contentLines = contentBuffer.trim().split("\n");

const initialValues = contentLines[0].split(" ").map(val => parseInt(val, 10));
const directionSeries = contentLines[1];

let diceConfig = {
  up: initialValues[0],
  back: initialValues[1],
  right: initialValues[2],
  left: initialValues[3],
  front: initialValues[4],
  down: initialValues[5],
};

const moveNorth = (current) => ({
  up: current.back,
  back: current.down,
  right: current.right,
  left: current.left,
  front: current.up,
  down: current.front,
});

const moveSouth = (current) => ({
  up: current.front,
  back: current.up,
  right: current.right,
  left: current.left,
  front: current.down,
  down: current.back,
});

const moveWest = (current) => ({
  up: current.right,
  back: current.back,
  right: current.down,
  left: current.up,
  front: current.front,
  down: current.left,
});

const moveEast = (current) => ({
  up: current.left,
  back: current.back,
  right: current.up,
  left: current.down,
  front: current.front,
  down: current.right,
});

const transformationMap = {
  "N": moveNorth,
  "S": moveSouth,
  "W": moveWest,
  "E": moveEast,
};

const finalConfiguration = directionSeries.split("").reduce((currentConfiguration, instruction) => {
  const rotationFunction = transformationMap[instruction];
  return rotationFunction(currentConfiguration);
}, diceConfig);

const displayResult = finalConfiguration.up;
process.stdout.write(displayResult.toString() + "\n");