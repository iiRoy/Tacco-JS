const sourceConfiguration = { dataPath: '/dev/stdin', lineDelimiter: '\n' };

const fileContent = require('fs').readFileSync(sourceConfiguration.dataPath, 'ascii');
const [targetString, querySubstring] = fileContent.split(sourceConfiguration.lineDelimiter, 2);

const searchExpression = new RegExp(querySubstring, 'g');
const foundPositions = [];

for (const matchResult of targetString.matchAll(searchExpression)) {
  foundPositions.push(matchResult.index);
}

console.log(foundPositions.join('\n'));
