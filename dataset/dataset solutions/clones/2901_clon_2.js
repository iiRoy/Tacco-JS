// This function receives the entire raw data string.
function ProcessInput(rawData) {

   var  parsedValues = rawData.split(" ");
  
   var   firstNum = parseInt(parsedValues[0], 10);

   var secondNum = parseInt(parsedValues[1], 10);
   var halfSecond = 0;
   halfSecond = Math.floor(secondNum / 2);
   var remainderSecond = secondNum % 2;
   var halfAdjustedFirst = Math.floor((firstNum * 3 + remainderSecond) / 2);
   var remainderAdjustedFirst = (firstNum * 3 + remainderSecond) % 2;
 // console.debug(halfSecond, remainderSecond, halfAdjustedFirst, remainderAdjustedFirst);
   console.log( halfSecond + halfAdjustedFirst );


   }    //    End of primary processing logic.

/* Do not modify the following section; it handles reading from standard input and invoking the core processing routine. */
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));