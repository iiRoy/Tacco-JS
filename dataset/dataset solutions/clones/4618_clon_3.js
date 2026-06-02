const extractAndCapitalizeFirstChar = (textSegment) => {
  return textSegment.charAt(0).toUpperCase();
};

const processInput = (rawData) => {
  const cleanedInput = rawData.trim();
  const inputSegments = cleanedInput.split(' ');

  const transformedChars = inputSegments.map(extractAndCapitalizeFirstChar);

  const [firstChar1, firstChar2, firstChar3] = transformedChars;

  console.log(firstChar1 + firstChar2 + firstChar3);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const stdinContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInput(stdinContent);