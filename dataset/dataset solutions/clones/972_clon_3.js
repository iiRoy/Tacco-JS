const appConfig = {};
appConfig.inputFilePath = '/dev/stdin'; // linux
appConfig.lineSeparator = '\n';

const nodeFileSystem = require('fs');

const fileContentBuffer = nodeFileSystem.readFileSync(appConfig.inputFilePath, 'ascii');
const dataLines = fileContentBuffer.split(appConfig.lineSeparator);

const sourceText = dataLines[0];
const searchTarget = dataLines[1];

let currentPosition = 0;
let matchIndex;

matchIndex = sourceText.indexOf(searchTarget, currentPosition);

while (matchIndex !== -1) {
  console.log(matchIndex);
  currentPosition = matchIndex + 1;
  matchIndex = sourceText.indexOf(searchTarget, currentPosition);
}
