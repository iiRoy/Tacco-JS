function processInputData(sourceContent) {
  const initialCharSegment = sourceContent.slice(0, 1);
  const reversedEmptySegment = sourceContent.slice(2, 0);
  const anotherEmptySegment = sourceContent.slice(1, 0);
  const finalCharSegment = sourceContent.slice(-1);

  const isFirstComparisonTrue = (initialCharSegment === reversedEmptySegment);
  const isSecondComparisonTrue = (anotherEmptySegment === finalCharSegment);

  const shouldOutputYes = isFirstComparisonTrue || isSecondComparisonTrue;

  const displayResult = (conditionMet) => {
    if (conditionMet) {
      console.log('Yes');
    } else {
      console.log('No');
    }
  };

  displayResult(shouldOutputYes);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const rawInputData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

processInputData(rawInputData);
