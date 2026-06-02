const processInputAndConvert = (inputData) => {
  const digitSymbols = '0abcdefghijklmnopqrstuvwxyz';

  const initialValue = BigInt(inputData.trim());

  const generateConversionString = (currentNumber) => {
    if (currentNumber === 0n) {
      return '';
    }

    const currentRemainder = currentNumber % 26n;
    const nextNumber = currentNumber / 26n;

    return generateConversionString(nextNumber) + digitSymbols[Number(currentRemainder)];
  };

  const finalOutput = generateConversionString(initialValue);

  console.log(finalOutput);
};

process.env.MYTEST ? test() : processInputAndConvert(require('fs').readFileSync('/dev/stdin', 'utf8'));
