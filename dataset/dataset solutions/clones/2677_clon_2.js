// The parameter 'rawData' holds the entire input stream.
function ProcessNumericalData (rawData) {


 rawData = rawData.split(" ");

 // Use parseInt to convert the string representation into a base-10 integer.
 var evaluatedNumericValue = parseInt ( rawData[0] , 10 ) ;

 var calculatedOutcome = 0;

 if ( evaluatedNumericValue <= 9 ) {
  var calculatedOutcome = evaluatedNumericValue ;
 } else if ( evaluatedNumericValue >= 10 && evaluatedNumericValue <= 99 ) {
  calculatedOutcome = 9;
 }
 else if ( evaluatedNumericValue >= 100 && evaluatedNumericValue <= 999 ) {
  calculatedOutcome = evaluatedNumericValue - 99 + 9;
 }
 else if ( evaluatedNumericValue >= 1000 && evaluatedNumericValue <= 9999 ) {
  calculatedOutcome = 909;
 }

 else if ( evaluatedNumericValue >= 10000 && evaluatedNumericValue <= 99999 ) {
  calculatedOutcome = evaluatedNumericValue - 9999 + 909;
 }
 else {
  var calculatedOutcome = 90909;
 }


 console.log( calculatedOutcome );

}


// The following line should not be modified; it handles input/output and invokes the primary processing routine.
ProcessNumericalData(require("fs").readFileSync("/dev/stdin", "utf8"));