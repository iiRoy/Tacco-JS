var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataRows = fileContent.split('\n');

dataRows.shift();

let initialCandidate = dataRows.shift();

let finalResult = dataRows.reduce((currentSmallest, nextEntry) => {
    return (nextEntry < currentSmallest) ? nextEntry : currentSmallest;
}, initialCandidate);

console.log(finalResult);
