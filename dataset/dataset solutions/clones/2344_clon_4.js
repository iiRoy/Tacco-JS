const processInputData = (sourceText) => {
  const extractedNumbers = sourceText.match(/\d+/g);

  const cumulativeSum = extractedNumbers.reduce((currentTotal, numberString) => {
    return currentTotal + Number(numberString);
  }, 0);

  if (cumulativeSum >= 22) {
    console.log('bust');
  } else {
    console.log('win');
  }
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
