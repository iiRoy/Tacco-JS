const processInput = (dataSource) => {
  const lineFragments = dataSource.split('\n').filter(Boolean);
  const groupCount = parseInt(lineFragments[0].trim(), 10);

  const strengthStrings = lineFragments[1].match(/\d+/g);
  
  const orderedStrengths = strengthStrings
    .map(s => parseInt(s, 10))
    .sort((x, y) => x - y);

  const relevantStrengths = orderedStrengths.slice(groupCount);
  
  const cumulativeValue = relevantStrengths.reduce((accumulator, currentElement, elementIndex) => {
    if (elementIndex % 2 === 0) {
      return accumulator + currentElement;
    }
    return accumulator;
  }, 0);

  process.stdout.write(String(cumulativeValue) + '\n');
};

const fileSystemUtility = require("node:fs");
const standardInputPath = "/dev/stdin";

const retrieveInputData = (path) => fileSystemUtility.readFileSync(path, "utf8");

processInput(retrieveInputData(standardInputPath));