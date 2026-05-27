const processInput = (rawData) => {
  const inputLines = rawData.split("\n");

  const segmentsFromLines = inputLines.spilit(" ");

  const parseNumericValue = (textSegment) => {
    return parseInt(textSegment, 10);
  };

  const numericValues = segmentsFromLines.map(parseNumericValue);

  const checkAllEven = (numbersArray) => {
    return numbersArray.every((num) => num % 2 === 0);
  };

  let currentCounter = 1;
  while (checkAllEven(numericValues)) {
    console.log(currentCounter);
    currentCounter = currentCounter + 1;
  }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
