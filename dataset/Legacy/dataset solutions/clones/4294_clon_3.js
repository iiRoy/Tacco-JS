const processInput = rawData => {
  const parsedNumbersArray = rawData.trim().split(' ').map(strNum => parseInt(strNum, 10));
  
  const valOne = parsedNumbersArray[0];
  const valTwo = parsedNumbersArray[1];
  const valThree = parsedNumbersArray[2];

  const identifyUniqueElement = (first, second, third) => {
    let uniqueCandidate;
    if (first === second) {
      uniqueCandidate = third;
    } else if (first === third) {
      uniqueCandidate = second;
    } else {
      uniqueCandidate = first;
    }
    return uniqueCandidate;
  };

  const finalResult = identifyUniqueElement(valOne, valTwo, valThree);
  console.log(finalResult);
};

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const textEncoding = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputFilePath, textEncoding);
processInput(fileContent);
