function processInputData(inputString) {
  const [firstNum, secondNum] = inputString.match(/\d+/g).map(Number);

  function* pairGenerator(upperBound) {
    let currentLeft = 1;
    let currentRight = upperBound - 1;
    let adjustmentMade = false;

    while (currentLeft < currentRight) {
      if (upperBound % 2 === 0 && !adjustmentMade && (currentRight - currentLeft) <= (upperBound / 2)) {
        currentRight--;
        adjustmentMade = true;
      }
      yield `${currentLeft} ${currentRight}`;
      currentLeft++;
      currentRight--;
    }
  }

  const pairIterator = pairGenerator(firstNum);

  for (let count = 0; count < secondNum; count++) {
    const { value } = pairIterator.next();
    console.log(value);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
