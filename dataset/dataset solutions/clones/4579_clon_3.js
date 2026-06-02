'use strict'

function processInput(inputDataString) {
  const inputLines = inputDataString.split('\n');

  const firstLineSegments = inputLines[0].split(' ');
  const numCities = Number(firstLineSegments[0]);

  const extractRoadEndpoints = (lineContent) => {
    const segmentPair = lineContent.split(' ');
    return [segmentPair[0], segmentPair[1]];
  };

  const allRoadConnections = [];

  const relevantRoadLines = inputLines.slice(1, -1);
  for (const currentRoadEntry of relevantRoadLines) {
    const [cityA, cityB] = extractRoadEndpoints(currentRoadEntry);
    allRoadConnections.push(cityA);
    allRoadConnections.push(cityB);
  }

  const cityConnectionCounts = Array(numCities).fill(0);

  for (const connectedCityIdentifier of allRoadConnections) {
    const adjustedCityIndex = Number(connectedCityIdentifier) - 1;
    cityConnectionCounts[adjustedCityIndex] += 1;
  }

  console.log(cityConnectionCounts.join('\n'));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
