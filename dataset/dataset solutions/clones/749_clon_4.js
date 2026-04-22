const acquireData = require('fs').readFileSync('/dev/stdin', 'utf8');
const collectionOfLines = acquireData.trim().split("\n");

function calculateValue(parameterA, parameterB, parameterC, parameterD, parameterE, countX, countY, countZ) {
  const remainderZ = countZ % parameterD;
  const neededComplement = parameterD - remainderZ;

  const baseCostZ = (countZ - remainderZ) * parameterE + parameterD * parameterE;

  const totalAuxiliaryAvailable = countX + countY;
  const utilizedAuxiliaryUnits = Math.min(totalAuxiliaryAvailable, neededComplement);

  const countXUtilized = Math.min(countX, utilizedAuxiliaryUnits);
  const remainingCountX = countX - countXUtilized;
  const countYUtilized = Math.min(countY, utilizedAuxiliaryUnits - countXUtilized);
  const remainingCountY = countY - countYUtilized;

  const extraCostPerUtilizedUnit = (remainderZ * parameterC <= parameterD * parameterE) ? 0 : parameterE;

  const totalExtraCostFromUtilized = utilizedAuxiliaryUnits * extraCostPerUtilizedUnit;

  const costFromRemainingUnits = parameterA * remainingCountX + parameterB * remainingCountY;

  return baseCostZ + totalExtraCostFromUtilized + costFromRemainingUnits;
}

function processLineSegments(remainingSegments) {
  if (remainingSegments.length < 2) {
    return;
  }

  const initialSegment = remainingSegments[0];
  if (initialSegment === "0 0 0 0 0") {
    return;
  }

  const dataValues = (initialSegment + " " + remainingSegments[1]).split(" ").map(Number);

  const p1 = dataValues[0];
  const p2 = dataValues[1];
  const p3 = dataValues[2];
  const p4 = dataValues[3];
  const p5 = dataValues[4];
  const cx = dataValues[5];
  const cy = dataValues[6];
  const cz = dataValues[7];

  const calculatedResult = calculateValue(p1, p2, p3, p4, p5, cx, cy, cz);
  console.log(calculatedResult);

  processLineSegments(remainingSegments.slice(2));
}

processLineSegments(collectionOfLines);