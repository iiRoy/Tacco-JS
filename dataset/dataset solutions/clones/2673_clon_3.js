const processInput = rawData => {
  const inputLines = rawData.split('\n');
  const firstRelevantLine = inputLines[0];
  const stringComponents = firstRelevantLine.split(' ');
  
  const parsedNumbers = stringComponents.map(strVal => parseInt(strVal, 10));

  const firstNum = parsedNumbers[0];
  const secondNum = parsedNumbers[1];
  const thirdNum = parsedNumbers[2];

  const differenceOfFirstTwo = firstNum - secondNum;
  const preliminaryResult = thirdNum - differenceOfFirstTwo;

  const finalCalculatedValue = preliminaryResult < 0 ? 0 : preliminaryResult;
  
  console.log(finalCalculatedValue);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
