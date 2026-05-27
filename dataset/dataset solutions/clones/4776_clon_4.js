const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const targetString = fileContent.split('\n')[0];
const modifiedString = targetString.split(',').join(' ');
console.log(modifiedString);
