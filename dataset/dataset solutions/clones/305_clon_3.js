const AREA_CONVERSION_DIVISOR = 3.305785;
let accumulatedInputString = '';

function handleIncomingData(dataPortion) {
  accumulatedInputString += dataPortion;
}

function processEndOfInput() {
  const numericInputComponents = accumulatedInputString.split(' ');

  const performCalculation = (firstValString, secondValString, divisorConstant) => {
    const firstNumericValue = Number(firstValString);
    const secondNumericValue = Number(secondValString);
    const productOfValues = firstNumericValue * secondNumericValue;
    const finalCalculatedResult = productOfValues / divisorConstant;
    return finalCalculatedResult;
  };

  const outputValue = performCalculation(
    numericInputComponents[0],
    numericInputComponents[1],
    AREA_CONVERSION_DIVISOR
  );

  console.log(outputValue);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', handleIncomingData);
process.stdin.on('end', processEndOfInput);
