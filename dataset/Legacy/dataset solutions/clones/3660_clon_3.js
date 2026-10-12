function processInput(rawData) {
  const inputLines = rawData.split("\n");

  const firstLineContent = inputLines[0];
  const firstNum = Number(firstLineContent);

  const secondLineContent = inputLines[1];
  const numberStrings = secondLineContent.split(" ");

  const numberArray = numberStrings.map(itemStr => Number(itemStr));

  const initialAccumulatorValue = 0;
  const sumOfNumbers = numberArray.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, initialAccumulatorValue);

  const finalCalculatedValue = sumOfNumbers - firstNum;

  console.log(finalCalculatedValue);
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(fileData);
