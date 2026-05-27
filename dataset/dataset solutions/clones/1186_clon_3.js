function getStdinContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function DiceSimulator(initialFaces) {
  this.faceValues = initialFaces;

  const rotationPatterns = new Map();

  rotationPatterns.set('N', (current) => [current[1], current[5], current[2], current[3], current[0], current[4]]);
  rotationPatterns.set('E', (current) => [current[3], current[1], current[0], current[5], current[4], current[2]]);
  rotationPatterns.set('S', (current) => [current[4], current[0], current[2], current[3], current[5], current[1]]);
  rotationPatterns.set('W', (current) => [current[2], current[1], current[5], current[0], current[4], current[3]]);

  this.applyRotation = function(directionCommand) {
    const currentFaceState = this.faceValues;
    const rotationFunction = rotationPatterns.get(directionCommand);
    if (rotationFunction) {
      this.faceValues = rotationFunction(currentFaceState);
    }
  };
}

function ProcessInput(rawInputString) {
  const linesArray = rawInputString.split("\n");
  const initialDiceFaces = linesArray[0].split(" ");
  const rotationCommandsString = linesArray[1];

  const activeDice = new DiceSimulator(initialDiceFaces);

  for (const moveInstruction of rotationCommandsString) {
    activeDice.applyRotation(moveInstruction);
  }

  console.log(activeDice.faceValues[0]);
}

ProcessInput(getStdinContent());
