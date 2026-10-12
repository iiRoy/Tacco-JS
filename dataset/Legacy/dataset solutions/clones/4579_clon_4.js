'use strict';

function processCityConnections(inputData) {
  const lineSegments = inputData.split('\n');

  const totalCities = Number(lineSegments[0].split(' ')[0]);

  const allEndpoints = lineSegments.slice(1, -1).flatMap(
    (roadDefinition) => {
      const [firstCity, secondCity] = roadDefinition.split(' ').map(Number);
      return [firstCity, secondCity];
    }
  );

  const cityConnectionCounts = allEndpoints.reduce(
    (accumulator, currentCityId) => {
      accumulator[currentCityId - 1] += 1;
      return accumulator;
    },
    Array(totalCities).fill(0)
  );

  console.log(cityConnectionCounts.join('\n'));
}

processCityConnections(require("fs").readFileSync("/dev/stdin", "utf8"));
