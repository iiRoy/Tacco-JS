process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputDataLines = [];
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLine) => {
  inputDataLines.push(currentLine);
});

inputProcessor.on('close', () => {
  var firstInputVal = inputDataLines[0];

  const targetNumbers = ["3", "5", "7"];
  let finalDecision;

  if (targetNumbers.includes(firstInputVal)) {
    finalDecision = "YES";
  } else {
    finalDecision = "NO";
  }

  console.log(finalDecision);
});
