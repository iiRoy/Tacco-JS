var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

var tokenArray = rawData.split(' ');

var comparisonResult;
if (tokenArray[0] === tokenArray[1]) {
    comparisonResult = '=';
} else if (tokenArray[0] < tokenArray[1]) {
    comparisonResult = '<';
} else {
    comparisonResult = '>';
}
console.log(comparisonResult);
