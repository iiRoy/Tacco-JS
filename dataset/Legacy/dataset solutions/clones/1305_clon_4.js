const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const transformedSegments = Array.from(rawInputData).map(charUnit => {
  const isUppercaseAlpha = /[A-Z]/.test(charUnit);
  return isUppercaseAlpha ? charUnit.toLowerCase() : charUnit.toUpperCase();
});

const finalProcessedString = transformedSegments.join('').trim();

console.log(finalProcessedString);
