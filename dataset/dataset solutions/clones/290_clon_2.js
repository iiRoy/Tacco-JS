var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var dataRows = rawData.split('\n');

var currentRow;
while (currentRow = dataRows.shift()) {
    var parts = currentRow.trim().split(/ +/);
    var operandPile = [];
    while (parts.length) {
        var currentPart = parts.shift();
        if (+currentPart == currentPart) {
            operandPile.push(currentPart);
        } else {
            var valA = operandPile.pop();
            var valB = operandPile.pop();
            operandPile.push(eval(valB + currentPart + valA));
        }
    }
    console.log(operandPile.pop().toFixed(6));
}
