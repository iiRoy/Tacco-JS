function main(inputString) {
  const inputLines = inputString.split("\n");
  const relevantLine = inputLines[1];
  let numberStrings = relevantLine.split(" ");

  let divisionCount = 0;

  const checkAllElementsEven = (elementsArray) => {
    for (let index = 0; index < elementsArray.length; index++) {
      const currentNumericValue = parseInt(elementsArray[index], 10);
      if (currentNumericValue % 2 !== 0) {
        return false;
      }
    }
    return true;
  };

  const processHalvingOperation = (elementsArray) => {
    const halvedElements = elementsArray.map(currentStringElement => {
      const numericValueToHalve = parseInt(currentStringElement, 10);
      // Using bitwise right shift for integer division by 2,
      // which is equivalent to e / 2 for positive even numbers.
      const resultOfHalving = numericValueToHalve >> 1;
      return resultOfHalving.toString(); // Keep array elements as strings
    });
    return halvedElements;
  };

  while (checkAllElementsEven(numberStrings)) {
    divisionCount = divisionCount + 1;
    numberStrings = processHalvingOperation(numberStrings);
  }

  console.log(divisionCount);
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
main(fileContent);
