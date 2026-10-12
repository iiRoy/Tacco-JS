let rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let lines = rawContent.trim().split('\n');
let entryCount = Number(lines.shift());

let dataMap = new Map();

lines.slice(0, entryCount).forEach(currentLine => {
  let parts = currentLine.split(' ');
  let identifier = parts[0];
  let numericValue = Number(parts[1]);
  dataMap.set(identifier, (dataMap.get(identifier) || 0) + numericValue);
});

let sortedIdentifiers = Array.from(dataMap.keys()).sort((firstKey, secondKey) => {
  let lengthDifference = firstKey.length - secondKey.length;
  if (lengthDifference !== 0) {
    return lengthDifference;
  }
  return firstKey.localeCompare(secondKey);
});

sortedIdentifiers.forEach(currentIdentifier => {
  console.log(`${currentIdentifier} ${dataMap.get(currentIdentifier)}`);
});
