// This module handles raw incoming text data
function ProcessSource(sourceData)
{
  // Each line from the sourceData becomes an element in an array
  sourceData = sourceData.split( "\n" ); // Split into individual strings by newline

  /* Original commented line:
  // input1 = input.split('').map((n) => (parseInt(n)))
  */

  // Transform string lines into integers, excluding the very first element
  let parsedNumbers = sourceData.map( (segment) => parseInt(segment) )
                                .filter( (numVal, idx) => (idx !== 0) )
  ;

  /* Original commented line:
  // var arr = input.map((n) => parseInt(n))
  */

  let calculatedResult = 0; // Initialize a placeholder for a final computation

  parsedNumbers.forEach( (currentNum, currIdx) => {

    // Original commented line:
    // console.log(Math.max(arr.filter((num, s) => (s != i))))

    // For each number, find the maximum among all other numbers in the sequence
    console.log(
      parsedNumbers.filter( (compareVal, compareIdx) => (compareIdx !== currIdx) )
                   .reduce( (maxFound, nextNumber) => (Math.max(maxFound, nextNumber)) )
    );
  } ); // End of forEach loop

  // Section dedicated to producing the final output
  // Original commented line:
  // console.log(ans )
}

// Do not alter the following section (it reads input and invokes the primary handler)
// ProcessSource( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
ProcessSource( require( 'fs' ).readFileSync( './input.txt', 'utf-8' ) );