function Main(inputData) {
  const limitCount = inputData[0][1];
  const sourceNumbers = inputData[1];

  const largestElements = [];

  const incorporateValue = (newValue) => {
    if (largestElements.length < limitCount) {
      largestElements.push(newValue);
      largestElements.sort((a, b) => a - b);
    } else if (newValue > largestElements[0]) {
      largestElements[0] = newValue;
      largestElements.sort((a, b) => a - b);
    }
  };

  for (let i = 0; i < sourceNumbers.length; ++i) {
    const currentNum = sourceNumbers[i];

    incorporateValue(currentNum * 2);

    for (let j = i + 1; j < sourceNumbers.length; ++j) {
      const otherNum = sourceNumbers[j];
      const sumPair = currentNum + otherNum;
      incorporateValue(sumPair);
      incorporateValue(sumPair);
    }
  }

  const finalResult = largestElements.reduce((accumulator, val) => accumulator + val, 0);

  console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number))
);
