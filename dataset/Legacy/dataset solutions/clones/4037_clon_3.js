function processInput(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const firstLineContent = inputLines[0];

  const numberStrings = firstLineContent.split(" ");

  const dividendValue = parseInt(numberStrings[0], 10);
  const divisorValue = parseInt(numberStrings[1], 10);

  const calculateFinalResult = (valX, valY) => {
    const isRemainderPresent = (valX % valY !== 0);
    const determinedValue = isRemainderPresent ? valX : -1;
    return determinedValue;
  };

  const computedResult = calculateFinalResult(dividendValue, divisorValue);

  console.log(String(computedResult));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
