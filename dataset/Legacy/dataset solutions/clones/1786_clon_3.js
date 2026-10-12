function extractStringPrefix(sourceString, lengthLimit) {
  const effectiveLimit = Math.max(0, Math.floor(lengthLimit));
  return sourceString.substring(0, effectiveLimit);
}

function processInputData(incomingData){
  const desiredPrefixLength = 3;
  const processedResult = extractStringPrefix(incomingData, desiredPrefixLength);
  console.log(processedResult);
}

const fileSystemUtility = require("fs");
const standardInputPath = "/dev/stdin";
const textEncodingFormat = "utf8";

const fullInputContent = fileSystemUtility.readFileSync(standardInputPath, textEncodingFormat);
processInputData(fullInputContent);
