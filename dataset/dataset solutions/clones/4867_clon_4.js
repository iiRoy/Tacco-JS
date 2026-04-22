const nodeIO = require("node:fs");
const stdInputPath = "/dev/stdin";
const rawData = nodeIO.readFileSync(stdInputPath, "utf8");
const dataLines = rawData.trim().split("\n");

let lineCursor = 0;
const totalLines = dataLines.length;

function obtainNextLine() {
  if (lineCursor >= totalLines) {
    throw new Error("No further data available.");
  }
  return dataLines[lineCursor++];
}

const textTransformers = new Map([
  [1, (s) => Number.parseInt(s)],
  [2, (s) => s.split(" ")],
  [4, (s) => s.split(" ").map(Number)],
  [6, (s) => s.split("")],
  [7, (s) => s.split("").map(Number)],
]);

const collectionTransformers = new Map([
  [8, (arr) => arr.join(" ")],
  [9, (arr) => arr.join("\n")],
  [0, (arr) => arr.join("")],
]);

function interpretData(payload, transformIdentifier) {
  if (typeof payload === 'string') {
    const transformer = textTransformers.get(transformIdentifier);
    if (transformer) return transformer(payload);
  } else if (Array.isArray(payload)) {
    const transformer = collectionTransformers.get(transformIdentifier);
    if (transformer) return transformer(payload);
  }
  return payload;
}

function outputToConsole(content) {
  console.log(content);
}

function outputToStderr(content) {
  console.error(content);
}

function orchestrateTraversal() {
  const dimensions = interpretData(obtainNextLine(), 4);
  const gridHeight = dimensions[0];
  const gridWidth = dimensions[1];

  const terrainMap = new Array(gridHeight);
  for (let idx = 0; idx < gridHeight; idx++) {
    terrainMap[idx] = interpretData(obtainNextLine(), 6);
  }

  // Memoization table: 0 = uncomputed, 1 = possible, -1 = impossible
  const outcomeCache = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => 0)
  );

  function determinePathExistence(yCurrent, xCurrent) {
    if (yCurrent === 0 && xCurrent === 0) {
      return 1;
    }

    if (outcomeCache[yCurrent][xCurrent] !== 0) {
      return outcomeCache[yCurrent][xCurrent];
    }

    let nextStepOutcome = -1; // Default to impossible

    if (xCurrent === 0) {
      if (yCurrent > 0 && terrainMap[yCurrent - 1][xCurrent] === "#") {
        nextStepOutcome = determinePathExistence(yCurrent - 1, xCurrent);
      }
    } else if (yCurrent === 0) {
      if (xCurrent > 0 && terrainMap[yCurrent][xCurrent - 1] === "#") {
        nextStepOutcome = determinePathExistence(yCurrent, xCurrent - 1);
      }
    } else {
      const potentialUpCell = terrainMap[yCurrent - 1][xCurrent];
      const potentialLeftCell = terrainMap[yCurrent][xCurrent - 1];

      if (
        (potentialUpCell === "#" && potentialLeftCell === ".") ||
        (potentialLeftCell === "#" && potentialUpCell === ".")
      ) {
        if (potentialUpCell === "#") {
          nextStepOutcome = determinePathExistence(yCurrent - 1, xCurrent);
        } else {
          nextStepOutcome = determinePathExistence(yCurrent, xCurrent - 1);
        }
      }
    }

    outcomeCache[yCurrent][xCurrent] = nextStepOutcome;
    return nextStepOutcome;
  }

  const finalResult = determinePathExistence(gridHeight - 1, gridWidth - 1);

  if (finalResult === 1) {
    outputToConsole("Possible");
  } else {
    outputToConsole("Impossible");
  }
}

orchestrateTraversal();