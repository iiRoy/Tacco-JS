const _fileSystem = require("fs");
const _dataBuffer = Buffer.alloc(1024);
const _readBytes = _fileSystem.readSync(process.stdin.fd, _dataBuffer, 0, _dataBuffer.length, 0);
const _parsedInput = _dataBuffer.toString("utf8", 0, _readBytes);

const _vowelCollection = new Set(["a", "e", "i", "o", "u", ""]);
const _isVowelResult = _vowelCollection.has(_parsedInput);

const _outcomeMapping = new Map();
_outcomeMapping.set(true, "vowel");
_outcomeMapping.set(false, "consonant");

console.log(_outcomeMapping.get(_isVowelResult));