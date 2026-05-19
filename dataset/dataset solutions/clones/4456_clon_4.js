const fileSystem = require('fs');
const inputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = inputBuffer.split(/\r?\n/);
const firstLine = inputLines[0];

const outputString = "ABC" + firstLine;
process.stdout.write(outputString + '\n');
