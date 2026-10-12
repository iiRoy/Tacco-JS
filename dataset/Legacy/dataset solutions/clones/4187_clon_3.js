function executeMainLogic(sourceData) {
  const trimmedInputString = sourceData.trim();

  const parseNumericString = (dataString) => {
    const stringParts = dataString.split(" ");
    const numericArray = stringParts.map(val => {
      const convertedNumber = Number(val);
      return convertedNumber;
    });
    return numericArray;
  };

  const numericValues = parseNumericString(trimmedInputString);

  const valueA = numericValues[0];
  const valueB = numericValues[1];
  const valueC = numericValues[2];

  const productOfAandB = valueA * valueB;

  const finalResult = Math.min(productOfAandB, valueC);

  console.log(finalResult);
}

const fileSystemHandler = require('fs');
const standardInputPath = '/dev/stdin';
const rawFileContent = fileSystemHandler.readFileSync(standardInputPath, 'utf8');

executeMainLogic(rawFileContent);
