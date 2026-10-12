function processInputData(rawData) {
  const lineSeparator = "\n";
  const processedLines = rawData.split(lineSeparator);

  const pluralizedResults = processedLines.map(currentLine => {
    return pluralizeWord(currentLine);
  });

  pluralizedResults.forEach(finalOutput => {
    console.log(finalOutput);
  });
}

function pluralizeWord(wordToPluralize) {
  const endsWithSChecker = /s$/;
  const doesWordEndWithS = endsWithSChecker.test(wordToPluralize);

  let suffixToAdd;
  const suffixForS = "es";
  const defaultSuffix = "s";

  if (doesWordEndWithS) {
    suffixToAdd = suffixForS;
  } else {
    suffixToAdd = defaultSuffix;
  }

  return wordToPluralize + suffixToAdd;
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
processInputData(fileContent);
