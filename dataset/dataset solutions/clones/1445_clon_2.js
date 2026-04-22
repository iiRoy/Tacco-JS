// This script processes numerical data sets from standard input to compute standard deviations.
var fileSystemModule = require ( 'fs' ) ; // Obtain the Node.js file system module for input operations.
var rawInputData = fileSystemModule . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read all data from standard input as a UTF-8 string.

// Prepare the input: remove leading/trailing whitespace and split into an array of lines.
var inputLinesCollection = rawInputData . trim ( ) . split ( "\n" ) ;

// Begin an infinite loop to process multiple data sets until a specific termination condition is met.
while ( true ) {

   // Extract the first line, convert it to a number, representing the count of elements for the current set.
   // The '- 0' ensures explicit conversion to a numeric type.
   var numElementsInSet = inputLinesCollection . shift ( ) - 0 ;

   // Check for the termination condition: if the number of elements is zero, exit the processing loop.
   if ( numElementsInSet === 0 ) {
      break ; // Break out of the while loop.
   }

   // Retrieve the next line, which contains the space-separated data points.
   // Split it by spaces and map each part to a numeric value.
   var numericalDataPoints = ( inputLinesCollection . shift ( ) ) . split ( " " ) . map ( Number ) ;

   // Calculate the sum of all numerical data points in the current set using the reduce method.
   var totalPointsSum = numericalDataPoints . reduce ( function ( accumulatorValue , currentValue ) {
      return accumulatorValue + currentValue ;
   } ) ;

   // Compute the arithmetic mean (average) of the data points.
   var arithmeticMean = totalPointsSum / numElementsInSet ;

   // Initialize a variable to store the sum of squared differences from the mean.
   var sumOfSquaredDeviations = 0.0 ;

   // Iterate over each data point to calculate and accumulate the squared difference from the mean.
   numericalDataPoints . forEach ( function ( currentPointValue ) {
      sumOfSquaredDeviations += Math . pow ( currentPointValue - arithmeticMean , 2 ) ;
   } ) ;

   // Calculate the final standard deviation by taking the square root of the average of squared deviations.
   var standardDeviationResult = Math . sqrt ( sumOfSquaredDeviations / numElementsInSet ) ;

   // Print the calculated standard deviation to the console, formatted to eight decimal places.
   console . log ( standardDeviationResult . toFixed ( 8 ) ) ;
}