const systemInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputLines = [];
systemInterface.on('line', (line) => {
  inputLines.push(line);
});

systemInterface.on('close', () => {
  executeCoreLogic();
});

let dataIndex = 0;
function retrieveNextValues() {
  const parts = inputLines[dataIndex].split(' ').map(Number);
  dataIndex++;
  return parts;
}

function executeCoreLogic() {
  const [totalItems] = retrieveNextValues();
  let accumulatedValue = calculateRecursiveSum(totalItems);

  for (let iterationCount = 0; iterationCount < totalItems - 1; iterationCount++) {
    let [startPoint, endPoint] = retrieveNextValues();
    
    if (startPoint > endPoint) {
      let exchangeBuffer = startPoint;
      startPoint = endPoint;
      endPoint = exchangeBuffer;
    }

    accumulatedValue -= startPoint * (totalItems - endPoint + 1);
  }

  process.stdout.write(String(accumulatedValue));
}

function calculateRecursiveSum(upperLimit) {
  if (upperLimit === 0) {
    return 0;
  }
  return calculateRecursiveSum(upperLimit - 1) + (upperLimit * (upperLimit + 1)) / 2;
}