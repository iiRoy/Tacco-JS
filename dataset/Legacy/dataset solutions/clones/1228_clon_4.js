'use strict';
(function() {
  const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const firstLineData = rawInputContent.split('\n')[0];
  const numericalComponents = firstLineData.match(/\d+/g).map(Number);

  const [
    boundaryWidth,
    boundaryHeight,
    coordinateX,
    coordinateY,
    circleRadius
  ] = numericalComponents;

  const differenceValue = coordinateY + coordinateX - boundaryHeight;
  const comparisonResultSign = Math.sign(differenceValue);

  const outcomeMapping = new Map([
    [1, 'No'],
    [0, 'yes'],
    [-1, 'yes']
  ]);

  console.log(outcomeMapping.get(comparisonResultSign));
})();
