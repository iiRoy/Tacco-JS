const processInput = (rawInputData) => {
  let currentNumber = BigInt(rawInputData.trim());
  const BASE_VALUE = 26n;
  const charLookup = 'zabcdefghijklmnopqrstuvwxyz';
  let resultCharacters = [];

  const getCharFromRemainder = (remainderValue) => {
    return charLookup[String(remainderValue)];
  };

  const determineNextNumber = (numToProcess) => {
    if (numToProcess === BASE_VALUE) {
      return 0n;
    } else {
      return numToProcess / BASE_VALUE;
    }
  };

  while (currentNumber !== 0n) {
    const nextIterationValue = determineNextNumber(currentNumber);
    const currentRemainder = currentNumber % BASE_VALUE;

    const charToAdd = getCharFromRemainder(currentRemainder);
    resultCharacters.unshift(charToAdd);

    currentNumber = nextIterationValue;
  }

  const finalResultString = resultCharacters.join('');
  console.log(finalResultString);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
