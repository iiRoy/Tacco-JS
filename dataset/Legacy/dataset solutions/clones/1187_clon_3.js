process.stdin.resume();
process.stdin.setEncoding("utf8");

const RL_MODULE = require("readline");
const PARSE_NUM = Number;

const inputReader = RL_MODULE.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputLines = [];

inputReader.on("line", (currentLine) => {
  inputLines.push(currentLine);
});

function rotateNorth(currentTop, currentFront, currentBottom, currentBack) {
  const nextTop = currentBack;
  const nextFront = currentTop;
  const nextBottom = currentFront;
  const nextBack = currentBottom;
  return [nextTop, nextFront, nextBottom, nextBack];
}

function rotateSouth(currentTop, currentFront, currentBottom, currentBack) {
  const nextTop = currentFront;
  const nextFront = currentBottom;
  const nextBottom = currentBack;
  const nextBack = currentTop;
  return [nextTop, nextFront, nextBottom, nextBack];
}

function rotateWest(currentTop, currentLeft, currentBottom, currentRight) {
  const nextTop = currentRight;
  const nextLeft = currentTop;
  const nextBottom = currentLeft;
  const nextRight = currentBottom;
  return [nextTop, nextLeft, nextBottom, nextRight];
}

function rotateEast(currentTop, currentLeft, currentBottom, currentRight) {
  const nextTop = currentLeft;
  const nextLeft = currentBottom;
  const nextBottom = currentRight;
  const nextRight = currentTop;
  return [nextTop, nextLeft, nextBottom, nextRight];
}

inputReader.on("close", () => {
  let [diceTop, diceBack, diceRight, diceLeft, diceFront, diceBottom] = inputLines[0].split(" ").map(PARSE_NUM);
  const rotationSequence = inputLines[1];

  for (let idx = 0; idx < rotationSequence.length; idx++) {
    const currentRotation = rotationSequence[idx];
    switch (currentRotation) {
      case "N":
        [diceTop, diceFront, diceBottom, diceBack] = rotateNorth(diceTop, diceFront, diceBottom, diceBack);
        break;
      case "S":
        [diceTop, diceFront, diceBottom, diceBack] = rotateSouth(diceTop, diceFront, diceBottom, diceBack);
        break;
      case "W":
        [diceTop, diceLeft, diceBottom, diceRight] = rotateWest(diceTop, diceLeft, diceBottom, diceRight);
        break;
      case "E":
        [diceTop, diceLeft, diceBottom, diceRight] = rotateEast(diceTop, diceLeft, diceBottom, diceRight);
        break;
    }
  }
  console.log(diceTop);
});
