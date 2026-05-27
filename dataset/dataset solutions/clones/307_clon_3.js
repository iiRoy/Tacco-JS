(function () {
   var accumulatedInput = '';

   const RADIX_DECIMAL_BASE = 10;

   function parseNumericString(valueString, base) {
     return parseInt(valueString, base);
   }

   function calculateAreaInTsubo(lengthValue, widthValue, conversionFactor) {
     const areaInSquareMeters = lengthValue * widthValue;
     return areaInSquareMeters / conversionFactor;
   }

   function executeCalculation () {
     var valA, valB, inputPartsArray;
     const TSUBO_UNIT_FACTOR = 3.305785;
     
     inputPartsArray = accumulatedInput.split(' ');
     
     valA = parseNumericString(inputPartsArray[0], RADIX_DECIMAL_BASE);
     valB = parseNumericString(inputPartsArray[1], RADIX_DECIMAL_BASE);
     
     const finalCalculatedResult = calculateAreaInTsubo(valA, valB, TSUBO_UNIT_FACTOR);
     
     console.log(finalCalculatedResult);
   }

   process.stdin.resume();
   process.stdin.setEncoding('utf8');
   process.stdin.on('data', function (receivedChunk) {
     accumulatedInput += receivedChunk;
   });

   process.stdin.on('end', function () {
     executeCalculation();
   });
}());
