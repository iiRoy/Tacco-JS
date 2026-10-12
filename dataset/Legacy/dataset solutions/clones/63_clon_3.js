const readline = require('readline');
const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let allInputTokens = [];
let tokenPointer = 0;

inputReader.on('line', (line) => {
  line.split(/\s+/).forEach(token => {
    if (token.length > 0) {
      allInputTokens.push(token);
    }
  });
});

inputReader.on('close', () => {
  processInputData();
});

const getNextToken = () => {
  if (tokenPointer >= allInputTokens.length) {
    throw new Error("Attempted to read past end of input tokens.");
  }
  return allInputTokens[tokenPointer++];
};

function processInputData() {
  const MAX_OVERFLOW_LENGTH = 80;

  const numSetsStr = getNextToken();
  const numSets = parseInt(numSetsStr);

  for (let currentSetIndex = 0; currentSetIndex < numSets; currentSetIndex++) {
    const firstOperand = BigInt(getNextToken());
    const secondOperand = BigInt(getNextToken());

    const sumResult = firstOperand + secondOperand;
    const sumStringRepresentation = sumResult.toString();

    const isSumOverflow = sumStringRepresentation.length > MAX_OVERFLOW_LENGTH;

    if (isSumOverflow) {
      console.log("overflow");
    } else {
      console.log(sumStringRepresentation);
    }
  }
}
