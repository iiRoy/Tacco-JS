let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let dataRows = rawData.split('\n');

let heightVal = parseInt(dataRows.shift().split(' ')[0], 10);

let distanceMatrix = [...Array(10)].map(() =>
  dataRows.shift().split(' ').map(currentVal => parseInt(currentVal, 10))
);

let itemFrequencies = new Array(10).fill(0);

for (let idx = 0; idx < heightVal; ++idx) {
  dataRows.shift().split(' ').map(elementValue => parseInt(elementValue, 10)).forEach(elementValue => {
    itemFrequencies[elementValue]++;
  });
}

for (let intermediateNode = 0; intermediateNode < 10; ++intermediateNode) {
  for (let sourceNode = 0; sourceNode < 10; ++sourceNode) {
    for (let destinationNode = 0; destinationNode < 10; ++destinationNode) {
      distanceMatrix[sourceNode][destinationNode] = Math.min(
        distanceMatrix[sourceNode][destinationNode],
        distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destinationNode]
      );
    }
  }
}

console.log(
  [...Array(10).keys()].reduce((accumulator, currentIdx) => {
    return accumulator + itemFrequencies[currentIdx] * distanceMatrix[currentIdx][1];
  }, 0)
);
