function processInputData(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const firstLineContent = inputLines[0];
  const numberStrings = firstLineContent.split(" ");

  const firstVal = parseInt(numberStrings[0], 10);
  const secondVal = parseInt(numberStrings[1], 10);
  const thirdVal = parseInt(numberStrings[2], 10);

  const calculateResult = (numerator, denominator) => {
    return Math.floor(numerator / denominator);
  };

  const numeratorComponent = firstVal - thirdVal;
  const denominatorComponent = thirdVal + secondVal;

  const finalResult = calculateResult(numeratorComponent, denominatorComponent);

  console.log('%s', finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
