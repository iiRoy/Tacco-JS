// Incoming text data is passed to this handler
function ProcessInput( rawData )
{
  // Split the raw input by newline characters to get an array of lines
  let linesArray = rawData.split( '\n' );

  // The first line often contains metadata, like the count of subsequent items.
  // We extract it but don't use it in this specific logic path.
  let countOfElements = linesArray.shift();

  // Convert remaining lines to an array of integers.
  let numericValues = linesArray.map(    itemString    =>    Number(itemString)    );

  // Initialize a boolean flag to track the presence of elements violating criteria.
  let hasProhibitedElement = false;

  // Filter the full set of numeric values to obtain only the even ones.
  let evenNumbers = numericValues.filter(   currentNumber   =>   currentNumber % 2 === 0   );

  // Iterate over the collection of even numbers to check for specific divisibility rules.
  evenNumbers.forEach(   currentNumber   =>
  {
    // An even number is deemed 'prohibited' if it is NOT divisible by 3 AND NOT divisible by 5.
    if ( (currentNumber % 3 !== 0) && (currentNumber % 5 !== 0) )
    {
      hasProhibitedElement = true; // Set flag if such an element is found.
    }
  }   );

  // Based on the flag, print the appropriate status message.
  if ( hasProhibitedElement )
  {
    console.log( "DENIED" );
  }
  else
  {
    console.log( "APPROVED" );
  }
}

// The following line handles system I/O; do not modify it.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );