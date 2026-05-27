const fileSystemModule = require('fs');
const entireInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const firstRelevantLine = entireInputContent.split('\n')[0];
const processedNumericValue = Number(firstRelevantLine);
console.log(`ABC${processedNumericValue}`);
