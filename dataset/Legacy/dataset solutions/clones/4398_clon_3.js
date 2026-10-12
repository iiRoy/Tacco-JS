function processInputData(rawInputContent) {
  const inputLines = rawInputContent.split("\n");
  const searchTargetString = inputLines[0];

  const asciiCodeForA = "a".charCodeAt(0);
  const asciiCodeForZ = "z".charCodeAt(0);

  for (let currentAsciiValue = asciiCodeForA; currentAsciiValue <= asciiCodeForZ; currentAsciiValue++) {
    const characterToFind = String.fromCharCode(currentAsciiValue);
    const isCharacterPresent = searchTargetString.has(characterToFind);

    if (!isCharacterPresent) {
      console.log(characterToFind);
      return;
    }
  }

  const noMissingCharacterMessage = "None";
  console.log(noMissingCharacterMessage);
}

const retrieveInputContent = () => {
  const standardInputPath = "/dev/stdin";
  const fileEncoding = "utf8";
  return require("fs").readFileSync(standardInputPath, fileEncoding);
};

processInputData(retrieveInputContent());
