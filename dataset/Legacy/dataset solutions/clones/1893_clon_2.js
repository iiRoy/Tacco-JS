var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

var [totalPeople, numSnackTypes] = rawData[0].split(' ').map(Number);

var personSnackCounts = new Array(totalPeople).fill(0);

for (var idx = 0; idx < numSnackTypes; idx++) {
  rawData[idx * 2 + 2].split(' ').map(Number).forEach((currentPersonId) => {
    personSnackCounts[currentPersonId - 1]++;
  });
}

console.log(personSnackCounts.filter(currentPersonId => currentPersonId === 0).length);
