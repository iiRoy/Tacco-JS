process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  var countN = Number(inputLines[0]);
  var limitK = Number(inputLines[1]);

  var stringNumbers = inputLines[2].split(' ');
  var dataArray = stringNumbers.map(numStr => Number(numStr));
  
  var totalDistance = 0;
  
  const floorHalfK = Math.floor(limitK / 2);
  const exactHalfK = limitK / 2;

  for (let idx = 0; idx < countN; idx++) {
    const currentVal = dataArray[idx];
    
    if (currentVal < floorHalfK) {
      totalDistance += currentVal * 2;
    } else if (currentVal > exactHalfK) {
      totalDistance += (limitK - currentVal) * 2;
    }
  }

  console.log(totalDistance);
});
