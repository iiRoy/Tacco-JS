const dataHandler = require('fs');
const rawBuffer = dataHandler.readFileSync('/dev/stdin');
const incomingText = rawBuffer.toString().trim();
const finalOutput = `ABC${incomingText}`;
process.stdout.write(finalOutput + '\n');