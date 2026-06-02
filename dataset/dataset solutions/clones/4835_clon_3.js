const fs = require("fs");

const processAndLogFirstChar = (segmentValue) => {
  const initialChar = segmentValue[0];
  console.log(initialChar);
};

const encodingType = "utf8";
const pathToFile = "/dev/stdin";
const segmentDelimiter = ' ';

const rawInputContent = fs.readFileSync(pathToFile, encodingType);

const processedSegments = rawInputContent.split(segmentDelimiter);

for (const currentSegment of processedSegments) {
  processAndLogFirstChar(currentSegment);
}
