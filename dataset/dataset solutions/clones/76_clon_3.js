let fileSystemModule = require('fs');

const processAndSortNumbers = inputString => {
  const trimmedInput = inputString.trim();
  const stringSegments = trimmedInput.split(" ");
  const parsedNumbers = stringSegments.map(Number);

  const sortInDescendingOrder = (valA, valB) => valB - valA;
  parsedNumbers.sort(sortInDescendingOrder);

  const finalOutputString = parsedNumbers.join(" ");
  console.log(finalOutputString);
};

const readInputFromFile = filePath => {
  const fileEncoding = 'utf8';
  fileSystemModule.readFile(filePath, fileEncoding, (errorObject, fileContent) => {
    // Original code does not explicitly handle errorObject,
    // so we pass fileContent as is, mirroring original behavior.
    processAndSortNumbers(fileContent);
  });
};

const readInputFromStdin = () => {
  const standardInputPath = '/dev/stdin';
  const defaultEncoding = 'utf8';
  const stdinContent = fileSystemModule.readFileSync(standardInputPath, defaultEncoding);
  processAndSortNumbers(stdinContent);
};

const commandLineArgs = process.argv;
const expectedMinArgsForPath = 3; // Node executable, script path, input file path

if (commandLineArgs.length >= expectedMinArgsForPath) {
  const inputFilePath = commandLineArgs[2];
  readInputFromFile(inputFilePath);
} else {
  readInputFromStdin();
}
