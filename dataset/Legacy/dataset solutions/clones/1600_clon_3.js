'use strict';

function checkTriangleValidity(candidateLengths) {
  const sortedSides = [...candidateLengths].sort((sideA, sideB) => sideB - sideA);

  const longest = sortedSides[0];
  const medium = sortedSides[1];
  const shortest = sortedSides[2];

  const satisfiesTriangleInequality = (longest - medium) < shortest;
  const allSidesAreDistinct = (longest !== medium) && (medium !== shortest);

  return satisfiesTriangleInequality && allSidesAreDistinct;
}

function processInputAndCompute(rawData) {
  const inputLines = rawData.split("\n");
  const totalLengthCount = parseInt(inputLines[0], 10);
  const lengthStringValues = inputLines[1].split(' ');
  const availableLengths = lengthStringValues.map(value => Number(value));

  let goodTriangleCount = 0;

  for (let firstIdx = 0; firstIdx < totalLengthCount; firstIdx++) {
    for (let secondIdx = firstIdx + 1; secondIdx < totalLengthCount; secondIdx++) {
      for (let thirdIdx = secondIdx + 1; thirdIdx < totalLengthCount; thirdIdx++) {
        const currentTriangleSides = [
          availableLengths[firstIdx],
          availableLengths[secondIdx],
          availableLengths[thirdIdx]
        ];

        if (checkTriangleValidity(currentTriangleSides)) {
          goodTriangleCount++;
        }
      }
    }
  }
  console.log(goodTriangleCount);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
