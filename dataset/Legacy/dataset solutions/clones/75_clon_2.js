let fileSystemModule = require('fs');

const processInputData = (inputStr) => {
  let tokenizedValues = inputStr.split(" ");
  let descendingNumbers = tokenizedValues.sort((valA, valB) => valB - valA);  
  console.log(descendingNumbers.join(" "));
};

const readFromFile = (filePath) => {
  fileSystemModule.readFile(filePath, 'utf8', (errorObj, fileContent) => {
    processInputData(fileContent);
  });
};

const readFromStandardInput = () => {
  const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processInputData(stdInputContent);
};

let inputSourcePath = "";

if (process.argv.length > 2) {
  inputSourcePath = process.argv[2];
  readFromFile(inputSourcePath);
} else {
  readFromStandardInput();
}
