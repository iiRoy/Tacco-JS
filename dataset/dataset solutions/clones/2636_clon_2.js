function ProcessData ( rawData )
{
  // Split the raw input string by newlines to get individual lines.
  rawData = rawData.split ( "\n" );

  // Extract the second line, split it by spaces, and convert each part to a number.
  let numericSequence = rawData[1].split ( " " ).map ( Number );

  // Sort the array of numbers in ascending order.
  numericSequence = numericSequence.sort ( function ( valA , valB ) { return valA - valB } );

  // Calculate the initial average of the first two elements.
  let currentAverage = ( numericSequence[0] + numericSequence[1] ) / 2;

  // Remove the first two elements from the sequence.
  numericSequence.shift ( );
  numericSequence.shift ( );

  // Continue processing as long as there are elements remaining in the sequence.
  while ( numericSequence.length !== 0 )
  {
    // Insert the current average back into the sequence at its sorted position.
    numericSequence.splice ( findInsertionPoint ( numericSequence , currentAverage ) , 0 , currentAverage );

    // Recalculate the average of the new first two elements.
    currentAverage = ( numericSequence[0] + numericSequence[1] ) / 2;

    // Again, remove the first two elements.
    numericSequence.shift ( );
    numericSequence.shift ( );
  }

  // Display the final calculated average.
  console.log ( currentAverage );
}

ProcessData ( require ( "fs" ).readFileSync ( "/dev/stdin" , "utf8" ).trim ( ) );

function findInsertionPoint ( dataCollection , valueToInsert )
{
  // Initialize an indicator for the found element's position.
  let foundPosition = -1;

  // Define the starting index for the search range.
  let lowerBound = 0;

  // Define the ending index for the search range.
  let upperBound = dataCollection.length - 1;

  // Perform binary search while the search range is valid.
  while ( lowerBound <= upperBound )
  {
    // Calculate the midpoint of the current search range.
    let midPoint = Math.floor ( ( lowerBound + upperBound ) / 2 );

    // Compare the element at the midpoint with the target value.
    if ( dataCollection[midPoint] === valueToInsert )
    {
      // If a match is found, record its position and terminate the search.
      foundPosition = midPoint;
      break;
    }
    else if ( dataCollection[midPoint] < valueToInsert )
    {
      // If the midpoint element is smaller, adjust the lower bound to search the right half.
      lowerBound = midPoint + 1;
    }
    else
    {
      // If the midpoint element is larger, adjust the upper bound to search the left half.
      upperBound = midPoint - 1;
    }
  }

  // Return the found position if the element was present, otherwise return the appropriate insertion point.
  if ( foundPosition !== -1 )
  {
    return foundPosition;
  }
  else
  {
    return lowerBound;
  }
}