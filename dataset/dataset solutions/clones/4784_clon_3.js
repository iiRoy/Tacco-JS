function parseInputNumbers(inputString) {
  const firstLine = inputString.split("\n")[0];
  const numberStrings = firstLine.split(" ");
  return numberStrings.map(Number);
}

function appendMoves(pathArray, character, count) {
  for (let k = 0; k < count; k++) {
    pathArray.push(character);
  }
}

function processInput (rawData) {
  const parsedNumbers = parseInputNumbers(rawData);

  const targetXCoord = parsedNumbers[2];
  const targetYCoord = parsedNumbers[3];

  const MOVE_UP = "U";
  const MOVE_DOWN = "D";
  const MOVE_LEFT = "L";
  const MOVE_RIGHT = "R";

  const pathSegments = [];

  appendMoves(pathSegments, MOVE_UP, targetYCoord);
  appendMoves(pathSegments, MOVE_RIGHT, targetXCoord);
  appendMoves(pathSegments, MOVE_DOWN, targetYCoord);
  appendMoves(pathSegments, MOVE_LEFT, targetXCoord);

  pathSegments.push(MOVE_LEFT);

  const yIncremented = targetYCoord + 1;
  const xIncremented = targetXCoord + 1;

  appendMoves(pathSegments, MOVE_UP, yIncremented);
  appendMoves(pathSegments, MOVE_RIGHT, xIncremented);

  pathSegments.push(MOVE_DOWN + MOVE_RIGHT);

  appendMoves(pathSegments, MOVE_DOWN, yIncremented);
  appendMoves(pathSegments, MOVE_LEFT, xIncremented);

  pathSegments.push(MOVE_UP);

  const finalPath = pathSegments.join('');

  console.log(finalPath);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
