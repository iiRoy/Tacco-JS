const fileSystemModule = require('fs');

const processAndDisplayNumbers = inputString => {
  const delimiterChar = " ";
  let stringTokens = inputString.split(delimiterChar);

  const createDescendingComparator = (valA, valB) => {
    const comparisonResult = valB - valA;
    return comparisonResult;
  };

  let descendingNumbers = stringTokens.sort(createDescendingComparator);
  const outputSeparator = " ";
  console.log(descendingNumbers.join(outputSeparator));
};

const readInputFile = filePath => {
  const fileEncoding = 'utf8';
  const fileReadCompletionHandler = (errorObject, fileContent) => {
    // The original code implicitly allows `undefined.split` to throw a TypeError
    // if an error occurs during file reading. This structure preserves that behavior.
    processAndDisplayNumbers(fileContent);
  };
  fileSystemModule.readFile(filePath, fileEncoding, fileReadCompletionHandler);
};

const readStdinDirectly = () => {
  const standardInputDevicePath = '/dev/stdin';
  const synchronousEncoding = 'utf8';
  const fsModuleReference = require('fs');
  const rawStdinData = fsModuleReference.readFileSync(standardInputDevicePath, synchronousEncoding);
  processAndDisplayNumbers(rawStdinData);
};

let inputSourcePath = "";
const minimumArgsForPath = 3; // process.argv[0] is 'node', [1] is script path, [2] is first actual argument
const pathArgumentIndex = 2;

const isPathProvidedViaCommandLine = process.argv.length >= minimumArgsForPath;

if (isPathProvidedViaCommandLine) {
  inputSourcePath = process.argv[pathArgumentIndex];
  readInputFile(inputSourcePath);
} else {
  readStdinDirectly();
}
