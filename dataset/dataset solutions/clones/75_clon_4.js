const fileSystemOps = require('fs');

const processInputData = (inputString) => {
  const extractedTokens = inputString.match(/\S+/g) || [];
  const numericalSequence = extractedTokens.map(Number);

  numericalSequence.sort((valA, valB) => valB - valA);

  const finalOutput = numericalSequence.reduce((accumulator, currentNum, idx) => {
    return accumulator + (idx === 0 ? '' : ' ') + String(currentNum);
  }, '');

  console.log(finalOutput);
};

const obtainFileContentAsync = async (sourcePath) => {
  const fileContent = await fileSystemOps.promises.readFile(sourcePath, 'utf8');
  processInputData(fileContent);
};

const acquireStdinContentSync = () => {
  const stdinContent = fileSystemOps.readFileSync('/dev/stdin', 'utf8');
  processInputData(stdinContent);
};

(async () => {
  const argumentCount = process.argv.length;
  const inputSourcePath = argumentCount > 2 ? process.argv[2] : null;

  if (inputSourcePath) {
    await obtainFileContentAsync(inputSourcePath);
  } else {
    acquireStdinContentSync();
  }
})();
