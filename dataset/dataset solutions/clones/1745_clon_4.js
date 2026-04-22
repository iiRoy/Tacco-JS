function processInputData(incomingString) {
  const interpretAsInteger = (textRepresentation) => parseInt(textRepresentation, 10);
  let initialQuantity = interpretAsInteger(incomingString);

  const recursivelyFormWord = (numericValue) => {
    if (numericValue === 0) {
      return "";
    }
    const residue = (numericValue - 1) % 26;
    const nextValue = Math.floor((numericValue - 1) / 26);
    const character = String.fromCharCode(97 + residue); // 'a' is ASCII 97
    return recursivelyFormWord(nextValue) + character;
  };

  const finalOutcome = recursivelyFormWord(initialQuantity);
  console.log(finalOutcome);
}

const retrieveDataSource = (filePath) => {
  const filesystemModule = require("fs");
  return filesystemModule.readFileSync(filePath, "utf8");
};

const standardInputPath = "/dev/stdin";
const rawIncomingData = retrieveDataSource(standardInputPath);

processInputData(rawIncomingData);