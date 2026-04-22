const fileSystemAccessor = require ( 'fs' ) ; // Obtain the file system utility

let rawDataSource = fileSystemAccessor . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Fetch content from standard input

let processedNumericSeries = ( rawDataSource . trim ( ) ) . split ( "\n" ) . map ( Number ) ; // Cleanse, segment, and convert input to a numerical array

while ( processedNumericSeries . length > 0 ) // Continue processing while the series contains elements
{
   let loopQuantity = ( processedNumericSeries . shift ( ) ) / 4 ; // Extract and prepare the iteration count

   if ( loopQuantity === 0 ) // If the iteration count is zero, exit the main cycle
   {
       break ;
   }

   let runningTally = 0 ; // Initialize accumulator for values

   while ( loopQuantity > 0 ) // Iterate according to the determined quantity
   {
       runningTally += processedNumericSeries . shift ( ) ; // Add the next value from the series to the tally
       loopQuantity -- ; // Decrement the iteration counter
   }

   console . log ( runningTally ) ; // Display the accumulated total for this segment
}