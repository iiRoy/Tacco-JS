function computeSumOfDigits(numberToProcess) {
    const numberAsString = String(numberToProcess);
    const digitCharacters = numberAsString.split('');
    return digitCharacters.reduce((totalAccumulator, charDigit) => totalAccumulator + Number(charDigit), 0);
}

function main(rawData){
  const inputLines = rawData.split('\n');
  const firstLineData = inputLines.shift();
  const firstLineParts = firstLineData.split(' ');
  const factorK = parseInt(firstLineParts[0], 10);

  let minDigitSum = Infinity;
  const MAX_ITERATIONS = 100000;

  for(let multiplier = 1; multiplier <= MAX_ITERATIONS; multiplier++){
    const productValue = factorK * multiplier;
    const currentSumOfDigits = computeSumOfDigits(productValue);

    if(currentSumOfDigits < minDigitSum){
      minDigitSum = currentSumOfDigits;
    }
  }

  console.log(minDigitSum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
