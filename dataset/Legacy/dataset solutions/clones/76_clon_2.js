let fileSystemModule = require('fs');

const processInputData = (inputString) => {
  let numericArray = (inputString.trim()).split(" ").map(Number);

  numericArray.sort(function(valA, valB) {
    return valB - valA;
  });

  console.log(numericArray.join(" "));
};

const processFileContent = (filePath) => {
  fileSystemModule.readFile(filePath, 'utf8', (errorObject, fileContent) => {
    processInputData(fileContent);
  });
};

const readStdinContent = () => {
  const stdinContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processInputData(stdinContent);
};

let inputSourcePath = "";

if (process.argv.length > 2) {
  inputSourcePath = process.argv[2];
  processFileContent(inputSourcePath);
} else {
  readStdinContent();
}
