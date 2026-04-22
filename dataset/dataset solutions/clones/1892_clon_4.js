const fileSystemUtils = require('node:fs');
const standardInputPath = process.stdin.fd;
const textEncodingIdentifier = 'utf8';

const incomingData = fileSystemUtils.readFileSync(standardInputPath, textEncodingIdentifier);

const outputMapping = new Map();
outputMapping.set("ABC", "ARC");

const fallbackValue = "ABC";
const resultantString = outputMapping.get(incomingData) ?? fallbackValue;

process.stdout.write(resultantString);