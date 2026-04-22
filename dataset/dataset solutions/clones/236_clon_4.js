const myFileSystem = require('fs');
const entireInputContent = myFileSystem.readFileSync('/dev/stdin', 'utf8');

const smallFloatThreshold = 1.0e-8;

function evaluateSegmentPair(
  coordAx, coordAy, coordBx, coordBy,
  coordCx, coordCy, coordDx, coordDy
) {
  let slopeAValue;
  let slopeBValue;

  const deltaAxComponent = coordBx - coordAx;
  const deltaAyComponent = coordBy - coordAy;
  const deltaCxComponent = coordDx - coordCx;
  const deltaCyComponent = coordDy - coordCy;

  if (deltaAxComponent === 0) {
    slopeAValue = Infinity;
  } else {
    slopeAValue = deltaAyComponent / deltaAxComponent;
  }

  if (deltaCxComponent === 0) {
    slopeBValue = Infinity;
  } else {
    slopeBValue = deltaCyComponent / deltaCxComponent;
  }

  let determinationResult = "NO";

  if ((slopeAValue === 0 && slopeBValue === Infinity) || (slopeBValue === 0 && slopeAValue === Infinity)) {
    determinationResult = "YES";
  } else if (slopeAValue !== Infinity && slopeBValue !== Infinity) {
    if ((slopeAValue * slopeBValue) + 1 < smallFloatThreshold) {
      determinationResult = "YES";
    }
  }

  return determinationResult;
}

const allInputLines = entireInputContent.trim().split("\n");

allInputLines.forEach(function(currentDataRow) {
  const parsedNumbers = currentDataRow.split(" ").map(Number);
  const [
    p1X, p1Y, p2X, p2Y,
    p3X, p3Y, p4X, p4Y
  ] = parsedNumbers;

  const lineResult = evaluateSegmentPair(
    p1X, p1Y, p2X, p2Y,
    p3X, p3Y, p4X, p4Y
  );
  console.log(lineResult);
});