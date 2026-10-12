const fileSystemModule = require("fs");
const inputFilePath = "/dev/stdin";
const encodingType = "utf8";

const rawInputContent = fileSystemModule.readFileSync(inputFilePath, encodingType);
const inputLines = rawInputContent.split("\n");

const targetLineIndex = 1;
const targetLine = inputLines[targetLineIndex];

const lineSegments = targetLine.split(" ");

const reversedSegments = lineSegments.reverse();

const finalOutputString = reversedSegments.join(' ');

console.log(finalOutputString);
