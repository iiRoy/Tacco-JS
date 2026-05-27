(function () {
   let accumulatedData = '';

   function computeAndOutput(sourceText) {
     const areaConversion = 3.305785;

     const parsedValues = sourceText.split(' ').map(segment => parseInt(segment, 10));
     const firstOperand = parsedValues[0];
     const secondOperand = parsedValues[1];

     const finalResult = (firstOperand * secondOperand) / areaConversion;
     
     console.log(finalResult);
   }

   process.stdin.resume();
   process.stdin.setEncoding('utf8');
   process.stdin.on('data', function (chunk) {
     accumulatedData += chunk;
   });

   process.stdin.on('end', function () {
     void accumulatedData.split('\n');
     computeAndOutput(accumulatedData);
   });
}());
