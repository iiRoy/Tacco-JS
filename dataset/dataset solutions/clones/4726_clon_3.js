function processData(rawInputString) {
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  let numOdds = 0;
  let numEvens = 0;

  const inputLines = rawInputString.split(NEWLINE_DELIMITER);

  const totalNumbersToProcess = parseInt(inputLines[0], 10);

  const allNumberStrings = inputLines[1].split(SPACE_DELIMITER);

  const processNumberForParity = (numberAsString) => {
    const currentNumber = parseInt(numberAsString, 10);
    if (currentNumber % 2 !== 0) {
      numOdds++;
    } else {
      numEvens++;
    }
  };

  const numbersToAnalyze = allNumberStrings.slice(0, totalNumbersToProcess);
  numbersToAnalyze.forEach(processNumberForParity);

  const finalResult = (numEvens % 2 !== 0) ? "YES" : "NO";
  console.log(finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
