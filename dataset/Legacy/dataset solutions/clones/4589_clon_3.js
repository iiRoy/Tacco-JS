process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function hasOddNumber(num1, num2, num3) {
  return num1 % 2 !== 0 || num2 % 2 !== 0 || num3 % 2 !== 0;
}

function parseInitialValues(lineString) {
  const parts = lineString.split(' ');
  return parts.map(Number);
}

lineReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

lineReader.on('close', () => {
  const initialValuesArr = parseInitialValues(inputLines[0]);

  let valA = initialValuesArr[0];
  let valB = initialValuesArr[1];
  let valC = initialValuesArr[2];

  let iterationCount = 0;

  if (valA === valB && valB === valC) {
    console.log("-1");
    return;
  }

  while (!hasOddNumber(valA, valB, valC)) {
    const nextA = (valB + valC) / 2;
    const nextB = (valA + valC) / 2;
    const nextC = (valB + valA) / 2;

    valA = nextA;
    valB = nextB;
    valC = nextC;

    iterationCount++;
  }

  console.log(iterationCount);
});
