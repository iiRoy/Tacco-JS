const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

var rawFileContent = fileSystemModule.readFileSync(standardInputPath, encodingType);

const valueDelimiter = ' ';
var stringTokens = rawFileContent.split(valueDelimiter);

var parsedNumbers = stringTokens.map(tokenString => parseInt(tokenString));

var firstOperand = parsedNumbers[0];
var secondOperand = parsedNumbers[1];

var intermediateProduct = firstOperand * secondOperand;
var finalCalculatedValue = intermediateProduct / 2;

console.log(finalCalculatedValue);
