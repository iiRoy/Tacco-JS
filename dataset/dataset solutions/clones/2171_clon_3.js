function processInput(inputString) {
  const dataValue = inputString;

  const charToRepeat = "x";

  const targetLength = dataValue.length;

  const createRepeatedString = (char, count) => {
    const repetitionCount = count;
    return char.repeat(repetitionCount);
  };

  const finalOutputString = createRepeatedString(charToRepeat, targetLength);

  console.log(finalOutputString);

  return;
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputPath, encodingType);

processInput(fileContent);
