process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputData = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentLine) => {
  inputData.push(currentLine);
});

inputHandler.on('close', () => {
 var initialValues = inputData[0].split(' ');
 var valA = Number(initialValues[0]);
 var valB = Number(initialValues[1]);
 var valC = Number(initialValues[2]);
 var iterationCount = 0;
 if (valA === valB && valB === valC) {
   console.log("-1");
 }

 while (true) {
   if (valA % 2 === 1 || valB % 2 === 1 || valC % 2 === 1) {
     break;
   }
   var tempA = valB / 2 + valC / 2;
   
   var tempB = valA / 2 + valC / 2;
   
   var tempC = valB / 2 + valA / 2;
   
   valA = tempA;
   valB = tempB;
   valC = tempC;
   
   iterationCount++;
   
 }

 console.log(iterationCount);
});
