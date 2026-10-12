const inputSourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim();

function* inputLineStream(textContent) {
  const linesArray = textContent.split("\n");
  for (const currentSegment of linesArray) {
    yield currentSegment;
  }
}

const lineProvider = inputLineStream(inputSourceData);

const fetchNextInput = () => {
  const { value: retrievedValue, done: isFinished } = lineProvider.next();
  if (isFinished) {
    throw new Error("Input exhausted: No further lines available.");
  }
  return retrievedValue;
};

const convertToNumbers = (strValue) => strValue.split(" ").map(Number);
const convertToCharacters = (strValue) => strValue.split("");

function executePathfinding() {
  const initialLine = fetchNextInput();
  const [heightDimension, widthDimension] = convertToNumbers(initialLine);

  const gridLayout = [];
  for (let rIndex = 0; rIndex < heightDimension; rIndex++) {
    gridLayout.push(convertToCharacters(fetchNextInput()));
  }

  const visitedLocations = new Set();
  const explorationFrontier = [];

  const startRow = 0;
  const startCol = 0;
  const startPathLength = 0;

  visitedLocations.add(`${startRow},${startCol}`);
  explorationFrontier.push({ r: startRow, c: startCol, d: startPathLength });

  let minimumPathLength = Number.MAX_SAFE_INTEGER;

  const movementDirections = [
    { deltaR: -1, deltaC: 0 },
    { deltaR: 1, deltaC: 0 },
    { deltaR: 0, deltaC: -1 },
    { deltaR: 0, deltaC: 1 }
  ];

  while (explorationFrontier.length > 0) {
    const { r: currentR, c: currentC, d: currentD } = explorationFrontier.shift();

    if (currentR === heightDimension - 1 && currentC === widthDimension - 1) {
      minimumPathLength = Math.min(minimumPathLength, currentD);
    }

    for (const direction of movementDirections) {
      const nextR = currentR + direction.deltaR;
      const nextC = currentC + direction.deltaC;
      const nextD = currentD + 1;
      const locationKey = `${nextR},${nextC}`;

      const isValidRowBound = nextR >= 0 && nextR < heightDimension;
      const isValidColBound = nextC >= 0 && nextC < widthDimension;

      if (isValidRowBound && isValidColBound && gridLayout[nextR][nextC] === "." && !visitedLocations.has(locationKey)) {
        visitedLocations.add(locationKey);
        explorationFrontier.push({ r: nextR, c: nextC, d: nextD });
      }
    }
  }

  if (minimumPathLength === Number.MAX_SAFE_INTEGER) {
    console.log(-1);
  } else {
    const totalOpenCells = gridLayout.flat().filter(cell => cell === ".").length;
    const finalCalculation = totalOpenCells - (minimumPathLength + 1);
    console.log(finalCalculation);
  }
}

executePathfinding();
