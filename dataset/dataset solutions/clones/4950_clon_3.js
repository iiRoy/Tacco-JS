function processInputString(rawData) {
  const splitPoint = 4;

  let initialSegment = rawData.slice(0, splitPoint);
  let remainingSegment = rawData.slice(splitPoint);

  const combinedOutput = `${initialSegment} ${remainingSegment}`;

  console.log(combinedOutput);
}

const fileSystemModule = require("fs");
const inputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const fileData = fileSystemModule.readFileSync(inputFilePath, fileEncoding);
processInputString(fileData);
