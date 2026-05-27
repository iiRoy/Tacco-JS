process.stdin.resume();
process.stdin.setEncoding("utf8");

const dataReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputLines = [];

dataReader.on("line", (currentLine) => {
  inputLines.push(currentLine);
});

dataReader.on("close", () => {
  const initialValues = inputLines[0].split(" ").map(Number);
  const rotationSequence = inputLines[1];

  const initialDiceState = {
    up: initialValues[0],    // top
    south: initialValues[1], // back
    east: initialValues[2],  // right
    west: initialValues[3],  // left
    north: initialValues[4], // front
    down: initialValues[5],  // bottom
  };

  const rotationHandlers = {
    N: (currentOrientation) => ({
      up: currentOrientation.south,
      down: currentOrientation.north,
      north: currentOrientation.up,
      south: currentOrientation.down,
      east: currentOrientation.east,
      west: currentOrientation.west,
    }),
    S: (currentOrientation) => ({
      up: currentOrientation.north,
      down: currentOrientation.south,
      north: currentOrientation.down,
      south: currentOrientation.up,
      east: currentOrientation.east,
      west: currentOrientation.west,
    }),
    W: (currentOrientation) => ({
      up: currentOrientation.east,
      down: currentOrientation.west,
      north: currentOrientation.north,
      south: currentOrientation.south,
      east: currentOrientation.up,
      west: currentOrientation.down,
    }),
    E: (currentOrientation) => ({
      up: currentOrientation.west,
      down: currentOrientation.east,
      north: currentOrientation.north,
      south: currentOrientation.south,
      east: currentOrientation.down,
      west: currentOrientation.up,
    }),
  };

  const finalOrientation = rotationSequence.split("").reduce((currentDice, rotationChar) => {
    const transformFunction = rotationHandlers[rotationChar];
    return transformFunction(currentDice);
  }, initialDiceState);

  console.log(finalOrientation.up);
});
