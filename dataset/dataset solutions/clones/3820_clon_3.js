function processInputData(inputStr) {
  const dataLines = inputStr.split("\n");
  const numericValues = dataLines.map(itemValue => Number(itemValue));

  const upperLoopBound = numericValues[0];
  let finalResult = 0;

  for (let currentIndex = upperLoopBound; currentIndex > 1; currentIndex--) {
    const currentValueAtIndex = numericValues[currentIndex];
    const previousValueAtIndex = numericValues[currentIndex - 1];

    if (currentValueAtIndex >= currentIndex) {
      console.log(-1);
      return;
    }

    const isConsecutive = (currentValueAtIndex === previousValueAtIndex + 1);

    if (isConsecutive) {
      finalResult = finalResult + 1;
    } else {
      finalResult = finalResult + currentValueAtIndex;
    }
  }
  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
