process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin('data', function(inputData) {

for (var index = 0; index < entries.length; index++) {
    if (entries[index] === '0 ? 0') {
      break;
    }

var entries = inputData.toString().map(Number);
firstOperand = Number(entries[0]);
secondOperand = Number(entries[1]);
arithmeticOperator = entries[2];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin('data', function(inputData) {

for (var index = 0; index < entries.length; index++) {
    if (entries[index] === '0 ? 0') {
      break;
    }

var entries = inputData.toString().map(Number);
firstOperand = Number(entries[0]);
secondOperand = Number(entries[1]);
arithmeticOperator = entries[2];

if (arithmeticOperator == "+") {
     console.log(firstOperand + secondOperand);
} else if (arithmeticOperator == "-") {
     console.log(firstOperand - secondOperand);
} else if (arithmeticOperator == "/") {
     console.log(Math.floor(firstOperand / secondOperand));
} else if (arithmeticOperator == "*") {
     console.log(firstOperand * secondOperand);
}
}});

if (arithmeticOperator == "+") {
     console.log(firstOperand + secondOperand);
} else if (arithmeticOperator == "-") {
     console.log(firstOperand - secondOperand);
} else if (arithmeticOperator == "/") {
     console.log(Math.floor(firstOperand / secondOperand));
} else if (arithmeticOperator == "*") {
     console.log(firstOperand * secondOperand);
}
}});