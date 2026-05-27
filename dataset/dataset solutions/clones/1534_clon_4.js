let inputBuffer = [];
let currentLineIndex = 0;

const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (line) => {
  inputBuffer.push(line);
});

inputReader.on('close', () => {
  console.error('\n↑入力 ↓出力');
  processMainLogic();
});

function getNextInputLine() {
  if (currentLineIndex < inputBuffer.length) {
    return inputBuffer[currentLineIndex++];
  }
  throw new Error('End of input reached.');
}

function parseNextInteger() {
  return parseInt(getNextInputLine());
}

function printOutput(data) {
  console.log(data);
}

function printDebug(data) {
  console.error('debug:' + require('util').inspect(data, false, null));
}

function createDeepClone(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function processMainLogic() {
  const targetValue = parseNextInteger();
  const modulus = 1000000007;

  const sumWays = new Array(2001).fill(0);

  if (targetValue >= 3) sumWays[3] = 1;
  if (targetValue >= 4) sumWays[4] = 1;
  if (targetValue >= 5) sumWays[5] = 1;

  for (let currentIdx = 6; currentIdx <= targetValue; currentIdx++) {
    const termA = sumWays[currentIdx - 1];
    const termB = sumWays[currentIdx - 3];
    sumWays[currentIdx] = (termA + termB) % modulus;
  }

  printOutput(sumWays[targetValue]);
}
