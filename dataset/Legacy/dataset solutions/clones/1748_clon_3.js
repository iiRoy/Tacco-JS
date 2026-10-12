const processInput = (rawData) => {
  const ALPHABET_MAP = '0abcdefghijklmnopqrstuvwxyz';
  const BASE_VALUE = 26n;
  const ZERO_VALUE = 0n;

  const cleanedInput = rawData.trim();
  let currentNumericValue = BigInt(cleanedInput);

  const collectedCharacters = [];
  while (currentNumericValue > ZERO_VALUE) {
    const currentRemainder = Number(currentNumericValue % BASE_VALUE);
    
    const characterForRemainder = ALPHABET_MAP[currentRemainder];
    collectedCharacters.unshift(characterForRemainder);

    const valueAfterSubtraction = currentNumericValue - BigInt(currentRemainder);
    currentNumericValue = valueAfterSubtraction / BASE_VALUE;
  }
  
  return console.log(collectedCharacters.join(''));
};

process.env.MYTEST ? test() : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
