function processInput(rawData) {
  const lineDelimiter = "/n";
  const parsedLines = rawData.split(lineDelimiter);

  console.log(parsedLines);

  const totalSegments = parsedLines.length;
  const initialSegment = parsedLines[0];
  const middleSegments = parsedLines.slice(1, totalSegments - 1);

  const calculateUniqueElementCount = (dataCollection) => {
    const distinctElements = new Set(dataCollection);
    return distinctElements.size;
  };

  const resultCount = calculateUniqueElementCount(middleSegments);
  console.log(resultCount);
}

const fileSystemUtility = require("fs");
const standardInputFile = "/dev/stdin";
const textEncoding = "utf8";

const fileContents = fileSystemUtility.readFileSync(standardInputFile, textEncoding);
processInput(fileContents);
