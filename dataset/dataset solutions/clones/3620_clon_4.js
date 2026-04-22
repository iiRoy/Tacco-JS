function processData(rawData) {
  const parsedNumbers = rawData.trim().split(/\s+/);

  const dividendValue = Number(parsedNumbers[0]);
  const divisorValue = Number(parsedNumbers[1]);

  let currentRemainder = dividendValue;

  while (currentRemainder >= divisorValue) {
    currentRemainder -= divisorValue;
  }

  const outputValue = (currentRemainder === 0) ? 0 : 1;

  console.log(outputValue);
}

const fileAccessUtility = require("fs");
const standardInputPath = "/dev/stdin";
const fileContent = fileAccessUtility.readFileSync(standardInputPath, "utf8");

processData(fileContent);