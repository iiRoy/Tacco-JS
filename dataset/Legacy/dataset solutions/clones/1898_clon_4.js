'use strict';

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawInput.split('\n');

const towerHeights = lines[1].split(' ').map(Number);
const numTowers = towerHeights.length;

const connectionMap = Array.from({ length: numTowers }, () => []);

lines.slice(2).forEach(connectionLine => {
  const [firstTower, secondTower] = connectionLine.split(' ').map(val => Number(val) - 1);
  connectionMap[firstTower].push(secondTower);
  connectionMap[secondTower].push(firstTower);
});

const totalPeaks = connectionMap.reduce((currentPeakCount, adjacentTowers, currentTowerIndex) => {
  const isCurrentTowerPeak = adjacentTowers.every(neighborIdx => {
    return towerHeights[currentTowerIndex] > towerHeights[neighborIdx];
  });

  return currentPeakCount + (isCurrentTowerPeak ? 1 : 0);
}, 0);

console.log(totalPeaks);
