const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const allLines = rawInputContent.trim().split('\n');

const [totalLocations, totalConnections] = allLines[0].split(' ').map(Number);
const locationHeights = allLines[1].split(' ').map(Number);

const viableViewpoints = new Set(Array.from({ length: totalLocations }, (_, p) => p));

allLines.slice(2, 2 + totalConnections).forEach(pathDescription => {
  const [pointOne, pointTwo] = pathDescription.split(' ').map(str => Number(str) - 1);

  const heightOne = locationHeights[pointOne];
  const heightTwo = locationHeights[pointTwo];

  if (heightOne <= heightTwo) {
    viableViewpoints.delete(pointOne);
  }
  if (heightTwo <= heightOne) {
    viableViewpoints.delete(pointTwo);
  }
});

console.log(viableViewpoints.size);