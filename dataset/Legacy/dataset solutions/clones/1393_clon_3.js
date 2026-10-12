(function(inputData){
    var parsedNumbers = inputData.split(' ');

    var firstNum = parsedNumbers[0];
    var secondNum = parsedNumbers[1];

    var divisionResult = firstNum / secondNum;
    var integerPart = Math.floor(divisionResult);
    var remainderPart = firstNum % secondNum;
    var fixedDecimalPart = divisionResult.toFixed(6);

    var finalOutput = integerPart + ' ' + remainderPart + ' ' + fixedDecimalPart;

    console.log(finalOutput);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
