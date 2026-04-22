// This function processes all incoming raw text data
function PerformComputation (  sourceData  )
{
  // Split the entire input string by newline characters into an array of lines.
  var   dataLines   =   sourceData.split( '\n' );

  // The first line of input typically contains space-separated values.
  var   segmentParts = dataLines[0].split( ' ' ) ;

  // Parse the first segment as an integer for the first operand.
  var   firstOperand  = parseInt( segmentParts[0], 10 );

  // Parse the second segment as an integer for the second operand.
  var   secondOperand = parseInt( segmentParts[1], 10 );


  // Calculate the initial outcome using absolute difference product.
  var calculatedOutcome = Math.abs( ( secondOperand - 2 ) * ( firstOperand - 2 ) );

  // Check if the calculated outcome exceeds a very large threshold.
  if ( calculatedOutcome > 1e15 )
  {
    // For very large numbers, perform calculations in parts to prevent overflow or precision issues.
    var   highSegment = Math.floor( firstOperand / 1000 ) ;
    var   lowSegment = firstOperand % 1000 ;

    // Calculate the lower part of the outcome.
    var lowOutcomePart = ( lowSegment - 2 ) * Math.abs( secondOperand - 2 ) ;

    // Combine parts for the final string representation of the large number.
    var calculatedOutcome = ( highSegment * Math.abs( secondOperand - 2 ) + Math.floor( lowOutcomePart / 1000 ) ) + '' ;
    calculatedOutcome += lowOutcomePart % 1000 + '' ;
  }

  // Output the final result to the console.
  console.info( calculatedOutcome ) ;
}

// *The following line should not be modified (it reads input from stdin and invokes the primary function)
PerformComputation(require("fs").readFileSync("/dev/stdin", "utf8"));