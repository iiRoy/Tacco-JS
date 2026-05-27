const fileSystem = require('fs');

let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let lineSegments = rawData.trim().split('\n');

while (true) {
  let currentCount = Number(lineSegments.shift());

  if (currentCount === 0) {
    break;
  }

  let columnTotals = [];
  for (let k = 0; k <= currentCount; k++) {
    columnTotals[k] = 0;
  }

  for (let k = 0; k < currentCount; k++) {
    let rowValues = lineSegments.shift().split(' ').map(Number);
    let rowSum = rowValues.reduce((accumulator, currentValue) => accumulator + currentValue);
    rowValues.push(rowSum);

    rowValues.forEach((element, index) => {
      columnTotals[index] += element;
    });

    rowValues.forEach((element, index) => {
      rowValues[index] = ('    ' + element).slice(-5);
    });

    console.log(rowValues.join(''));
  }

  columnTotals.forEach((element, index) => {
    columnTotals[index] = ('    ' + element).slice(-5);
  });

  console.log(columnTotals.join(''));
}
