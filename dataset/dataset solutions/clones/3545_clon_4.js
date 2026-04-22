var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var checkPattern = new RegExp('2');
var patternFound = checkPattern.test(inputData);
var responseMap = {
    'true': 'No',
    'false': 'Yes'
};
process.stdout.write(responseMap[patternFound.toString()] + '\n');