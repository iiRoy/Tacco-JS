const fileSystemModule = require('fs');
const STDIN_FILE_PATH = '/dev/stdin';

let fileContent = fileSystemModule.readFileSync(STDIN_FILE_PATH, 'utf8');
let inputLines = fileContent.trim().split("\n");

let keepProcessing = true;

while (keepProcessing) {
   let currentInputLine = inputLines.shift();
   let lineParts = currentInputLine.split(" ");

   let firstOperand = Number(lineParts[0]);
   // The original code calculates `b` as `ary[1]-0`.
   // If `ary[1]` is an operator string (e.g., "+", "-", "*", "/"),
   // `Number(lineParts[1])` will result in `NaN`.
   // This specific behavior is preserved to maintain exact observable equivalence.
   let secondOperandValue = Number(lineParts[1]);

   const operatorSymbol = lineParts[1];

   if (operatorSymbol === "%") {
       keepProcessing = false;
   } else {
       switch (operatorSymbol) {
           case "+":
               console.log(firstOperand + secondOperandValue);
               break;
           case "-":
               console.log(firstOperand - secondOperandValue);
               break;
           case "*":
               console.log(firstOperand * secondOperandValue);
               break;
           case "/":
               // The original code uses `~~(a/b)`.
               // The `~~` operator truncates towards zero and `~~NaN` evaluates to `0`.
               // `0 | value` is an equivalent bitwise operation that also truncates towards zero
               // and evaluates `0 | NaN` to `0`, preserving the exact behavior.
               console.log(0 | (firstOperand / secondOperandValue));
               break;
       }
   }
}
