function processInput(rawData) {
  // This function processes the given raw data.
  const [firstNum, secondNum] = rawData.split(' ');

  console.log(firstNum * secondNum);
}

processInput(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);
