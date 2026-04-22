function transformUnit(originalText) {
  const processedFragment = originalText.replace(/^\s+|\s+$/g, '');

  let currentCodeValue;

  if (processedFragment.length === 0) {
    currentCodeValue = NaN;
  } else {
    const initialCharacter = processedFragment.charAt(0);
    const characterRepresentation = Buffer.from(initialCharacter, 'utf16be');
    currentCodeValue = characterRepresentation.readUInt16BE(0);
  }

  const nextCodeValue = currentCodeValue + 1;

  const outputRepresentation = Buffer.alloc(2);
  outputRepresentation.writeUInt16BE(nextCodeValue, 0);

  const resultSymbol = outputRepresentation.toString('utf16be');

  process.stdout.write(resultSymbol);
}

const systemIO = require("fs");
const incomingData = systemIO.readFileSync("/dev/stdin", "utf8");

transformUnit(incomingData);