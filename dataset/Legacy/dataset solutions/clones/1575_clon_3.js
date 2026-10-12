function processData(rawContent) {
  const MODULO_CHECK_VALUE = 9;

  const parseCharToNum = (charItem) => {
    return parseInt(charItem, 10);
  };

  const computedSum = [...rawContent]
    .map(parseCharToNum)
    .reduce((currentAccumulator, currentNumber) => {
      return currentAccumulator + currentNumber;
    }, 0);

  const remainderAfterDivision = computedSum % MODULO_CHECK_VALUE;

  let resultString;
  if (remainderAfterDivision === 0) {
    resultString = "Yes";
  } else {
    resultString = "No";
  }

  console.log(resultString);
}

const fileSystemReader = require("fs");
const standardInputPath = "/dev/stdin";
const fileContent = fileSystemReader.readFileSync(standardInputPath, "utf8");

processData(fileContent);
