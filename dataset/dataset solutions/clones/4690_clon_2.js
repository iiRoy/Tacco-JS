/* This module performs a specific numerical computation. */
function ComputeValue ( rawEntry )
{
  // First, parse the incoming raw text into an integer number.
  rawEntry = parseInt( rawEntry . trim() . split(" ") ) ;

  // Next, calculate the primary component of the final figure.
  let baseCalculation = 800.0 * rawEntry ;

  // Then, compute a specific reduction amount based on a floor division.
  let deductionValue = 200.0 * Math.floor( rawEntry / 15.0 ) ;

  // Finally, display the net result of the calculation.
  console.log( baseCalculation - deductionValue ) ;
}

// The main processing function is called here,
// acquiring its input from the standard input stream.
ComputeValue ( require("fs") . readFileSync("/dev/stdin", "utf8") ) ;