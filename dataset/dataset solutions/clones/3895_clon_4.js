const processInputData = (rawText) => {
  const lines = rawText.trim().split('\n');
  const [boundaryValue, , pivotPoint] = lines[0].split(' ').map(Number);
  const costMarkers = new Set(lines[1].split(' ').map(Number));

  const leftTraversalPoints = Array.from({ length: pivotPoint - 1 }, (_, idx) => idx + 1);
  const rightTraversalPoints = Array.from({ length: boundaryValue - pivotPoint }, (_, idx) => idx + pivotPoint);

  const calculateCost = (pointsCollection, markerSet) => {
    return pointsCollection.reduce((accumulator, currentPoint) => {
      return accumulator + (markerSet.has(currentPoint) ? 1 : 0);
    }, 0);
  };

  const costOnApproachFromLeft = calculateCost(leftTraversalPoints, costMarkers);
  const costOnApproachFromRight = calculateCost(rightTraversalPoints, costMarkers);

  const determineLesserValue = (valueA, valueB) => (valueA < valueB ? valueA : valueB);

  globalThis.finalOutputHandler(determineLesserValue(costOnApproachFromLeft, costOnApproachFromRight));
};

globalThis.finalOutputHandler = (outcome) => console.log(outcome);

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));