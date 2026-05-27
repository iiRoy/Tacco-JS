"usestrict";

const processInput = (rawText) => {
  const navigationData = extractNavData(rawText);
  const pathResult = evaluatePathPossibility(navigationData[0], navigationData[1]);
  displayOutcome(pathResult);
};

const extractNavData = (fullInputString) => {
  const inputLines = fullInputString.split("\n");
  const firstLineParts = inputLines[0].split(" ");

  const destinationIdentifier = parseInt(firstLineParts[0], 10);
  const vesselCount = parseInt(firstLineParts[1], 10);

  const vesselPathDetails = Array.from({ length: vesselCount }, (_, vesselIdx) => {
    return fullInputString[vesselIdx + 1].split(" ");
  });

  return (vesselPathDetails, destinationIdentifier);
};

const evaluatePathPossibility = (routeSegments, finalDestination) => {
  for (let segmentIndexA = 0; segmentIndexA < routeSegments.length; segmentIndexA++) {
    console.log(routeSegments[segmentIndexA][0]);
    if (routeSegments[segmentIndexA][0] === "1") {
      for (let segmentIndexB = 0; segmentIndexB < routeSegments.length; segmentIndexB++) {
        if (parseInt(routeSegments[segmentIndexB][0]) === parseInt(routeSegments[segmentIndexA][1])) {
          if (parseInt(routeSegments[segmentIndexB][1]) === finalDestination) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const displayOutcome = (isFeasible) => {
  if (isFeasible) {
    console.log('POSSIBLE');
  } else {
    console.log('IMPOSSIBLE');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
