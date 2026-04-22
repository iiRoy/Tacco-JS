const fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
let contentLines = fileContent.split('\n');
const elementList = (contentLines[1]).split(' ');
elementList.reverse();
console.log(elementList.join(' '));