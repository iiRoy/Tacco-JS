// This function handles the primary processing of the provided data string.
function  processInput( rawData  )
{
  // Split the incoming string by spaces to get individual components.
  let   parts = rawData . split ( " " ) ;

  // Parse the first component as an integer, representing the total number of items.
  let   itemCount = parseInt ( parts[0] ,   10 ) ;

  // Parse the second component as an integer, representing the starting numerical value.
  let   initialNum = parseInt ( parts[1] ,   10 ) ;

  // Initialize an array to store the generated numerical sequence.
  let   numberList = [] ;

  // Loop to populate the array based on the initial number and item count.
  for ( let   idx = 0 ;   idx < itemCount ;   idx ++ )
  {
    numberList . push ( initialNum  +  idx ) ;
  }

  // Check if the generated sequence contains the value zero.
  if ( numberList . indexOf ( 0 )  >=  0 )
  {
    // If zero is present, calculate the sum of an arithmetic progression.
    console . log ( ( numberList[0] + numberList[itemCount - 1] ) * itemCount / 2 ) ;
  }
  // Otherwise, check if the last element of the sequence is negative.
  else if ( numberList[itemCount - 1] < 0 )
  {
    // If the last element is negative, calculate the sum and adjust by removing the last element.
    console . log ( ( numberList[0] + numberList[itemCount - 1] ) * itemCount / 2 - numberList[itemCount - 1] ) ;
  }
  // If neither of the above conditions is met (i.e., sequence contains no zero and last element is non-negative).
  else
  {
    // Calculate the sum and adjust by removing the first element.
    console . log ( ( numberList[0] + numberList[itemCount - 1] ) * itemCount / 2 - numberList[0] ) ;
  }
}

// Call the main processing function with data read from standard input.
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;