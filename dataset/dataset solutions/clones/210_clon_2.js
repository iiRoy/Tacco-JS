var   fileSystemModule  = require ('fs')
  , contentSize         = fileSystemModule . fstatSync ( process . stdin . fd ) . size
  , dataBuffer          = new Uint8Array ( contentSize )
  , dataBytesRead       = fileSystemModule . readSync ( process . stdin . fd , dataBuffer , 0 , contentSize , 0 )
  , inputLines          = Buffer . from ( dataBuffer . subarray ( 0 , dataBytesRead ) ) . toString ( 'utf8' ) . trim ( ) . split ( '\n' ) ;

// Kick off the primary execution flow
processEntries ( ) ;

/**
 * Executes the primary logic of the program.
 * It computes trailing zeros for each input number.
 */
function processEntries ( )
{
  const trailingZeroCounts = calculateTrailingZeros ( ) ; // Precompute zero counts

  for ( let lineIndex = 0 , totalLines = inputLines . length ; lineIndex < totalLines ; ++ lineIndex )
  {
    const currentInputNumber = parseInt ( inputLines [ lineIndex ] . trim ( ) , 10 ) ;
    console . log ( trailingZeroCounts [ currentInputNumber ] ) ;
  }
}

/**
 * Calculates the number of trailing zeros in the factorial of numbers
 * up to a specified upper limit.
 *
 * @returns {Float64Array} An array where index 'n' contains the count of trailing zeros in n!.
 */
function calculateTrailingZeros ( )
{
  const   upperLimit      = 20000 ;
  let     zeroCountsMemo  = new Float64Array ( upperLimit + 1 ) ; // Stores results

  // Iterate from 5 up to the maximum number
  for ( let currentNumber = 5 ; currentNumber <= upperLimit ; currentNumber ++ )
  {
    let tempNumber = currentNumber ;

    // Count factors of 5
    while ( ( tempNumber = Math . floor ( tempNumber / 5 ) ) )
    {
      zeroCountsMemo [ currentNumber ] += tempNumber ;
    }
  }

  return zeroCountsMemo ;
}