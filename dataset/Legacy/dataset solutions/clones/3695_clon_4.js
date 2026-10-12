const determineOutputValue = (inputNumber) => {
  return (inputNumber <= 2)
    ? 2
    : (inputNumber % 2 === 0)
      ? (2 * inputNumber)
      : null;
};

function processInputData(inputString) {
  const parsedNumber = Number(inputString);

  const finalResult = determineOutputValue(parsedNumber);

  if (finalResult !== null) {
    console.log(finalResult);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
