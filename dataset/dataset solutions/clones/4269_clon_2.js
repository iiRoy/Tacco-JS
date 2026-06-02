function processInput(rawData) {
  rawData = rawData.trim();
  let firstValue = rawData.split("\n")[0];
  let secondValue = rawData.split("\n")[1];
  console.log(secondValue * 2 - firstValue);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
