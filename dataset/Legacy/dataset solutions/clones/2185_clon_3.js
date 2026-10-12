function handleInputData(rawInputString) {
  const SPACE_DELIMITER = ' ';

  function parseNumbersFromString(inputStr, delimiter) {
    const stringParts = inputStr.split(delimiter);
    const firstParsedNum = Number(stringParts[0]);
    const secondParsedNum = Number(stringParts[1]);
    return [firstParsedNum, secondParsedNum];
  }

  const [factorOne, factorTwo] = parseNumbersFromString(rawInputString, SPACE_DELIMITER);

  const calculatedProduct = factorOne * factorTwo;
  const isProductOdd = (calculatedProduct % 2 !== 0);

  if (isProductOdd) {
    console.log('Odd');
  } else {
    console.log('Even');
  }
}

handleInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
