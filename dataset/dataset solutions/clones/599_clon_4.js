let currentMazeStructure;
let levelDimensions;
let objectiveStrength;

let pathMemo;

const directionOffsets = [
  [-1, 0], // Up
  [0, -1], // Left
  [0, 1],  // Right
  [1, 0]   // Down
];

function generateGridHash(gridArr) {
  return gridArr.map(row => row.join('')).join('|');
}

function findOptimalRoute(presentRow, presentCol, collectedStrength, traveledSegments, currentGridState) {
  const stateKey = `${presentRow},${presentCol},${collectedStrength},${generateGridHash(currentGridState)}`;

  if (pathMemo.has(stateKey)) {
    return pathMemo.get(stateKey);
  }

  if (collectedStrength === objectiveStrength + 1) {
    return traveledSegments;
  }

  let minimumPath = Infinity;

  let nextStrength = collectedStrength;
  const newGridForExploration = currentGridState.map(row => [...row]);

  if (newGridForExploration[presentRow][presentCol] === String(collectedStrength)) {
    nextStrength++;
    newGridForExploration[presentRow][presentCol] = '.';
  }

  for (const [dr, dc] of directionOffsets) {
    const nextRow = presentRow + dr;
    const nextCol = presentCol + dc;

    if (nextRow < 0 || nextRow >= levelDimensions[1] || nextCol < 0 || nextCol >= levelDimensions[0]) {
      continue;
    }

    if (newGridForExploration[nextRow][nextCol] === 'X') {
      continue;
    }

    const resultFromNeighbor = findOptimalRoute(
      nextRow,
      nextCol,
      nextStrength,
      traveledSegments + 1,
      newGridForExploration
    );

    minimumPath = Math.min(minimumPath, resultFromNeighbor);
  }

  pathMemo.set(stateKey, minimumPath);
  return minimumPath;
}

function processGameData(inputString) {
  const processedLines = inputString.trim().split('\n');

  const dimensionAndPower = processedLines.shift().split(' ').map(Number);
  levelDimensions = [dimensionAndPower[0], dimensionAndPower[1]];
  objectiveStrength = dimensionAndPower[2];

  let initialSpot = [];
  currentMazeStructure = [];
  for (let r = 0; r < levelDimensions[1]; r++) {
    const rowContent = processedLines.shift().split('');
    const startColumn = rowContent.indexOf('S');
    if (startColumn !== -1) {
      initialSpot = [startColumn, r];
    }
    currentMazeStructure.push(rowContent);
  }

  pathMemo = new Map();

  const startingMazeCopy = currentMazeStructure.map(row => [...row]);
  if (initialSpot.length > 0) {
    startingMazeCopy[initialSpot[1]][initialSpot[0]] = '.';
  }

  const calculatedAnswer = findOptimalRoute(
    initialSpot[1],
    initialSpot[0],
    1,
    0,
    startingMazeCopy
  );

  return calculatedAnswer === Infinity ? -1 : calculatedAnswer;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalResult = processGameData(fileContent);
console.log(finalResult);