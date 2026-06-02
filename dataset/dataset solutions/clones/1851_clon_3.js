const STD_IN_PATH = "/dev/stdin";
const UTF8_ENCODING = "utf8";

const readAndProcessStdin = () => {
  const fileSystemModule = require("fs");
  const rawContent = fileSystemModule.readFileSync(STD_IN_PATH, UTF8_ENCODING);
  const trimmedContent = rawContent.trim();
  const contentLines = trimmedContent.split("\n");
  return contentLines;
};

const truncateStringWithEllipsis = (textToProcess, limitValue, ellipsisSuffix) => {
  const currentLength = textToProcess.length;
  if (currentLength <= limitValue) {
    return textToProcess;
  } else {
    const truncatedPart = textToProcess.slice(0, limitValue);
    return truncatedPart + ellipsisSuffix;
  }
};

function processInput(inputDataLines) {
  const maxAllowedLength = +inputDataLines[0];
  const sourceString = inputDataLines[1];

  const ELLIPSIS_INDICATOR = '...';

  const resultString = truncateStringWithEllipsis(sourceString, maxAllowedLength, ELLIPSIS_INDICATOR);

  console.log(resultString);
}

processInput(readAndProcessStdin());

function parseSpaceSeparatedNumbers(inputString) {
  const stringParts = inputString.split(' ');
  const numericValues = stringParts.map(part => Number(part));
  return numericValues;
}
