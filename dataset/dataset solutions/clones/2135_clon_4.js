var fs = require("fs");
var bigInt = require("big-integer");

var main = function main(input) {
  var dataParts = input.split('\n')[0].split(' ');
  var numberValue = Number(dataParts[0]);
  var baseValue = Number(dataParts[1]);

  var resultCount;

  if (numberValue === 0) {
    resultCount = 0;
  } else {
    resultCount = Math.floor(Math.log(numberValue) / Math.log(baseValue)) + 1;
  }

  console.log(resultCount);
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
