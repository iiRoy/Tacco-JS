const extractNumericValues = (lineContent) => {
  const parts = lineContent.split(' ');
  const val1 = Number(parts[0]);
  const val2 = Number(parts[1]);
  return [val1, val2];
};

function processInputData(rawData) {
  const inputLine = rawData.split('\n')[0];

  const [firstNumber, secondNumber] = extractNumericValues(inputLine);

  if (firstNumber === secondNumber) {
    console.log(0);
    return;
  }

  const totalSum = firstNumber + secondNumber;

  const isSumEven = (totalSum % 2 === 0);

  if (isSumEven) {
    const halfSum = totalSum / 2;
    console.log(halfSum);
  } else {
    console.log('IMPOSSIBLE');
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
