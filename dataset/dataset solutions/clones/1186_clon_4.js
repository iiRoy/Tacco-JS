const transformationRules = new Map([
  ['N', ({ top, front, left, right, back, bottom }) => ({
    top: front,
    front: bottom,
    left: left,
    right: right,
    back: top,
    bottom: back
  })],
  ['E', ({ top, front, left, right, back, bottom }) => ({
    top: right,
    front: front,
    left: top,
    right: bottom,
    back: back,
    bottom: left
  })],
  ['S', ({ top, front, left, right, back, bottom }) => ({
    top: back,
    front: top,
    left: left,
    right: right,
    back: bottom,
    bottom: front
  })],
  ['W', ({ top, front, left, right, back, bottom }) => ({
    top: left,
    front: front,
    left: bottom,
    right: top,
    back: back,
    bottom: right
  })]
]);

const constructSolid = (values) => ({
  top: values[0],
  front: values[1],
  left: values[2],
  right: values[3],
  back: values[4],
  bottom: values[5]
});

const applyDirectionalShift = (currentSolidState, commandSymbol) => {
  const shiftFunction = transformationRules.get(commandSymbol);
  return shiftFunction ? shiftFunction(currentSolidState) : currentSolidState;
};

const executeSolidManipulation = (inputData) => {
  const lineSegments = inputData.trim().split("\n");
  const initialSurfaceValues = lineSegments[0].split(" ");
  const sequenceOfCommands = lineSegments[1].split("");

  const startingSolid = constructSolid(initialSurfaceValues);

  const finalSolidState = sequenceOfCommands.reduce(applyDirectionalShift, startingSolid);

  return finalSolidState.top;
};

const rawDataStream = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutputValue = executeSolidManipulation(rawDataStream);
console.log(finalOutputValue);