const extractAndCapitalizeFirstChar = (textSegment) => {
  if (textSegment && textSegment.length > 0) {
    return textSegment.charAt(0).toUpperCase();
  }
  return '';
};

const processInput = (rawData) => {
  const cleanedInput = rawData.trim();
  const inputSegments = cleanedInput.split(' ');

  const transformedChars = inputSegments.map(extractAndCapitalizeFirstChar);

  const [firstChar1, firstChar2, firstChar3] = transformedChars;

  const finalOutputString = [firstChar1, firstChar2, firstChar3].join('');
  console.log(finalOutputString);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const stdinContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInput(stdinContent);
