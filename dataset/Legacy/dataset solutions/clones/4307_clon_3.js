const TARGET_MARKER = "FESTIVAL";

function processInput(sourceText) {
  const lastOccurrenceIndex = sourceText.lastIndexOf(TARGET_MARKER);
  const resultSubstring = sourceText.slice(0, lastOccurrenceIndex);
  console.log(resultSubstring);
}

const fileSystemUtility = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";
const fileContent = fileSystemUtility.readFileSync(standardInputPath, textEncoding);

processInput(fileContent);
