function processData(inputLines) {
  const prefixConstant = "ABC";
  const firstLineContent = inputLines[0];
  const finalOutputString = prefixConstant + firstLineContent;
  console.log(finalOutputString);
}

function retrieveAndPrepareInput() {
  const fileSystemUtility = require('fs');
  const rawInputBuffer = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
  const cleanedInputString = rawInputBuffer.trim();
  const parsedInputArray = cleanedInputString.split("\n");
  return parsedInputArray;
}

const programInput = retrieveAndPrepareInput();
processData(programInput);
