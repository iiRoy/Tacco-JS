'use strict';

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = sourceData.trim().split('\n');

const structureHeightStrings = contentLines[1].split(' ');
const actualElevations = structureHeightStrings.map(str => parseInt(str, 10));

const connectionGraph = contentLines.slice(2).reduce((graphAccumulator, currentLine) => {
  const connectionPoints = currentLine.split(' ').map(s => parseInt(s, 10) - 1);
  const pointAlpha = connectionPoints[0];
  const pointBeta = connectionPoints[1];

  if (!graphAccumulator.has(pointAlpha)) {
    graphAccumulator.set(pointAlpha, new Set());
  }
  if (!graphAccumulator.has(pointBeta)) {
    graphAccumulator.set(pointBeta, new Set());
  }

  graphAccumulator.get(pointAlpha).add(pointBeta);
  graphAccumulator.get(pointBeta).add(pointAlpha);

  return graphAccumulator;
}, new Map());

const totalStructures = actualElevations.length;
const dominantStructuresCount = Array.from({ length: totalStructures }, (_, idx) => idx)
  .filter(currentStructureIdentifier => {
    const primaryElevation = actualElevations[currentStructureIdentifier];
    const adjacentNodes = connectionGraph.get(currentStructureIdentifier);

    if (!adjacentNodes || adjacentNodes.size === 0) {
      return true;
    }

    return Array.from(adjacentNodes).every(connectedIdentifier => {
      return primaryElevation > actualElevations[connectedIdentifier];
    });
  })
  .length;

console.log(dominantStructuresCount);