/*
 * This file contains a JavaScript routine designed to process
 * multi-line textual input, performing a specific arithmetic operation.
 * It reads data from a standard input stream.
 */
function PerformCalculation ( inputPayload )
{

  // The initial step involves splitting the entire input string
  // into an array of individual lines, using the newline character as a delimiter.
  let   dataLines = inputPayload.split( "\n" )
  ;


  // From the resulting array of lines, the first element (the very first line)
  // is extracted and converted into its numerical representation.
  const firstNumber = +dataLines[ 0 ]
  ;


  /*
   * Next, the second line from the input data is processed.
   * It is first split into substrings based on space characters,
   * and subsequently, each of these substrings is transformed into a number.
   */
  let valueCollection = dataLines[ 1 ]
                      .
                      split( " " )
                      .
                      map( stringItem => +stringItem )
  ;


  // All the numerical elements obtained from the second line
  // are then summed together to yield a single aggregate value.
  let   finalSum = valueCollection.reduce( ( runningSum , currentElement ) => runningSum + currentElement )
  ;


  // The final outcome, which is the difference between the aggregated sum
  // and the initial number from the first line, is then printed to the console.
  console.log( finalSum - firstNumber )
  ;

}

// The primary execution path of this script involves
// reading content from the standard input stream,
// converting it to UTF-8 encoding, and then passing
// this processed data to our main calculation function.
PerformCalculation
(
  require( "fs" )
  .
  readFileSync( "/dev/stdin" , "utf8" )
)
;