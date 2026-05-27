function calculateDistance(rawInputString) {
  const numericParts = rawInputString.split(" ").map(Number);

  let segmentWidth = numericParts[0];
  let startCoordA = numericParts[1];
  let startCoordB = numericParts[2];

  let finalDistance;

  if (startCoordA > startCoordB) {
    [startCoordA, startCoordB] = [startCoordB, startCoordA];
  }
  
  const endOfSegmentA = startCoordA + segmentWidth;

  if (endOfSegmentA >= startCoordB) {
    finalDistance = 0;
  } else {
    finalDistance = startCoordB - endOfSegmentA;
  }

  console.log(finalDistance);
}
  
function executeDebug() {
  const inputElement = document.getElementById("input");
  if (inputElement) {
    const debugInput = inputElement.value;
    calculateDistance(debugInput);
  } else {
    console.error("Debug input element not found.");
  }
}

calculateDistance(require("fs").readFileSync("/dev/stdin", "utf8"));
