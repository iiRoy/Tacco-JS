function processInputData(rawInputString) {
  const DELIMITER_CHAR = ' ';
  const inputParts = rawInputString.split(DELIMITER_CHAR);

  const convertToNumber = (strValue) => Number(strValue);

  let currentNum = convertToNumber(inputParts[0]);
  const targetBase = convertToNumber(inputParts[1]);

  let baseRepresentation = '';

  while (currentNum > 0) {
    const currentRemainder = currentNum % targetBase;
    baseRepresentation += currentRemainder;
    currentNum = Math.floor(currentNum / targetBase);
  }

  console.log(baseRepresentation.length);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
