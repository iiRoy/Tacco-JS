function ProcessNumericInput( rawTextData )
{
  // Parse the incoming string into an array of numerical values.
  const valueCollection = rawTextData
    .split( ' ' )
    .map( currentVal => Number( currentVal ) );

  // Extract the first numerical component.
  const firstQuantity = valueCollection[ 0 ];
  // Extract the second numerical component, representing a threshold or deduction.
  const deductionAmount = valueCollection[ 1 ];

  // Evaluate the relationship between the quantities.
  if ( firstQuantity <= deductionAmount )
  {
    // If the first quantity is less than or equal to the deduction, output zero.
    console.log( 0 );
  }
  else
  {
    // Otherwise, calculate and output the difference.
    console.log( firstQuantity - deductionAmount );
  }
}


// Entry point: Read input from standard input and pass it to the processing function.
ProcessNumericInput(
  require( "fs" )
    .readFileSync( "/dev/stdin", "utf8" )
);