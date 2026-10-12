var fileSystem = require('fs');
var rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

var processedInput = rawInputData.trim();
var parts = processedInput.split(" ");

var numA = Number(parts[0]);
var numB = Number(parts[1]);
var numC = Number(parts[2]);
var numD = Number(parts[3]);

const checkOdd = (value) => {
    const remainder = value % 2;
    return remainder !== 0;
};

var productResult = numA * numB;
var sumResult = numA + numB;

var isProductOdd = checkOdd(productResult);
var isSumOdd = checkOdd(sumResult);

var combinedCheck = isProductOdd && isSumOdd;

if (combinedCheck) {
    console.log("No");
} else {
    console.log("Yes");
}
