const processSequence = (sourceContent) => {
  const parsedLines = sourceContent.trim().split('\n');
  const itemCount = Number(parsedLines[0]);
  const valueCollection = parsedLines[1].split(' ').map(Number);

  if (itemCount <= 1) {
    return 0;
  }

  const comparisonResult = valueCollection.slice(0, itemCount).reduce((accumulator, currentElement, elementIndex, fullCollection) => {
    if (elementIndex > 0 && currentElement === fullCollection[elementIndex - 1]) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);

  return comparisonResult;
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const rawData = fileSystemModule.readFileSync(standardInputPath, textEncoding);
const finalOutcome = processSequence(rawData);
console.log(finalOutcome);