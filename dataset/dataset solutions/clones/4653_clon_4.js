const fileSystemModule = require("fs");
const standardInPath = "/dev/stdin";
const encodingFormat = "utf8";

const rawInputData = fileSystemModule.readFileSync(standardInPath, encodingFormat);

const lineSegments = rawInputData.split(/\r?\n/).filter(Boolean);

const selectionMagnitude = Number(lineSegments[0]);

const numericStringPart = lineSegments[1];

const unprocessedNumerics = numericStringPart.split(/\s+/).map(Number);

const orderedNumerics = unprocessedNumerics.sort((alpha, beta) => alpha - beta).reverse();

const accumulatedTotal = orderedNumerics
  .filter((_val, idx) => idx % 2 !== 0)
  .slice(0, selectionMagnitude)
  .reduce((acc, current) => acc + current, 0);

process.stdout.write(accumulatedTotal.toString() + "\n");