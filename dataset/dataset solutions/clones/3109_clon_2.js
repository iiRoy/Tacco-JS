/*
 * This utility function inserts a specific value into an array
 * at an index determined by the value itself.
 *
 * @param {Array<number>} targetArray   The array to modify.
 * @param {number} itemValue            The number to insert and also used to determine the insertion point.
 */
function placeElement(  targetArray,  itemValue  )
{
  // Use splice to insert itemValue at (itemValue - 1) index, without removing anything.
  targetArray . splice(  itemValue  -  1  ,  0  ,  itemValue  ) ;
}



/*
 * The primary function that orchestrates the data processing logic.
 * It reads input, performs checks, and generates an ordered output.
 *
 * @param {string} inputString   The raw string input from a source.
 */
function processInputData(  inputString  )
{
    // Parse the input string:
    // 1. Split by newline to get lines.
    // 2. Take the second line (index 1).
    // 3. Split that line by spaces.
    // 4. Convert each part to a number.
    var parsedNumbers  =  inputString . split("\n")[1] . split(" ") . map(Number) ;

    // The original code had a commented-out sort. We'll keep it commented out.
    // parsedNumbers  =  parsedNumbers . sort(  (first, second) => first - second  ) ;

    var dataLength  =  parsedNumbers . length  ; // Determine the count of numbers provided.
    var outputCollection  =  [  ]  ; // Initialize an empty array to store results.
    var anomalyDetected  =  false  ; // Flag to indicate if any number violates the expected sequence.

    // Iterate through each number in the parsed input.
    for  (  var  idx  =  0  ;  idx  <  dataLength  ;  idx++   )
    {
        var expectedCeiling  =  idx  +  1  ; // Calculate the maximum allowed value for the current position.
        var currentNumber  =  parsedNumbers[idx]  ; // Get the current number from the input list.

        // Check if the current number exceeds its expected upper limit.
        if  (  currentNumber  >  expectedCeiling  )
        {
            anomalyDetected  =  true  ; // Mark that an anomaly was found.
        }

        // Insert the current number into our result collection based on its value.
        placeElement(  outputCollection  ,  currentNumber  ) ;
    }

    // If any anomaly was detected during processing, print -1 and exit.
    if  (  anomalyDetected  )
    {
        console . log(  -1  ) ;
        return  ; // Terminate function execution.
    }

    // If no anomalies, print each element of the final ordered collection.
    for  (  var  displayCounter  =  0  ;  displayCounter  <  parsedNumbers . length  ;  displayCounter++   )
    {
        console . log(  outputCollection[displayCounter]  ) ;
    }
}

// Entry point: Read data from standard input and pass it to the processing function.
processInputData(  require('fs') . readFileSync(  '/dev/stdin'  ,  'utf8'  )  ) ;