const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputSegments = rawInputData.split('\n');
const tokenArray = inputSegments[1].split(' ');
const finalString = tokenArray.reduceRight((accumulator, currentWord) => {
    return accumulator === '' ? currentWord : accumulator + ' ' + currentWord;
}, '');
console.log(finalString);
