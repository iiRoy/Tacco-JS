'use strict';

const processInput = (rawLines) => {
  const pointCount = Number(rawLines[0]);

  const coordinates = rawLines.slice(1, 1 + pointCount).map(lineSegment => {
    const [horizontal, vertical] = lineSegment.split(' ').map(Number);
    return { h: horizontal, v: vertical };
  });

  const totalSpan = coordinates.reduce((accumulatedPathLength, currentVertex, currentIdx, allVertices) => {
    const segmentDistances = allVertices.slice(currentIdx).reduce((innerAccumulatedLength, otherVertex) => {
      const deltaHorizontal = currentVertex.h - otherVertex.h;
      const deltaVertical = currentVertex.v - otherVertex.v;
      return innerAccumulatedLength + Math.sqrt(deltaHorizontal * deltaHorizontal + deltaVertical * deltaVertical);
    }, 0);
    return accumulatedPathLength + segmentDistances;
  }, 0);

  console.log((totalSpan / pointCount) * 2);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
