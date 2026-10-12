var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedInput = fileContent.trim();
processedInput = processedInput.split('egg').join('E');
processedInput = processedInput.split('chicken').join('C');

var intermediateString = processedInput.split('EE').join('EAE');
intermediateString = intermediateString.split('CC').join('CAC');

var segmentList = intermediateString.split('A');

var longestSegment = segmentList.reduce(function(currentMax, currentVal) {
    return currentVal.length > currentMax.length ? currentVal : currentMax;
}, '');

if (longestSegment.charAt(longestSegment.length - 1) === 'E') {
    console.log('egg');
} else {
    console.log('chicken');
}
