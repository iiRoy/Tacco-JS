function processAndDisplaySum(rawData) {
  const cleanedData = rawData.trim();
  const stringParts = cleanedData.split(" ");

  const numericElements = stringParts.map(function(strVal) {
    return Number(strVal);
  });

  const firstOperand = numericElements[0];
  const secondOperand = numericElements[1];

  const totalSum = firstOperand + secondOperand;

  let finalOutputValue;
  const threshold = 10;

  if (totalSum < threshold) {
    finalOutputValue = totalSum;
  } else {
    finalOutputValue = "error";
  }

  console.log(finalOutputValue);
}

processAndDisplaySum(require('fs').readFileSync('/dev/stdin', 'utf8'));
