/*
 * This section provides an overview of the input data structure.
 * The 'input' variable receives the entire data as a single string.
 * Example input format:
 * 7              <- This is the number of lines/items to process
 * zenkoku        <- First string list
 * touitsu        <- Second string list
 * program        <- Third string list
 *
 * The script processes these lines to perform a character comparison.
 */
function     Main   (   input   )
{
  // The input string is split by newline characters to create an array of lines.
  // inputList[0] will contain the first line, inputList[1] the second, and so on.

  var
    inputList = input . split  ( "\n" )
  ;

  // The first line is parsed as an integer, representing the number of iterations.
  var inputNum = parseInt ( inputList [ 0 ] , 10 );

  // The subsequent lines are split into arrays of individual characters.
  var firstList  = inputList [ 1 ] . split ( "" ) ;
  var secondList = inputList [ 2 ] . split ( "" ) ;
  var thirdList  = inputList [ 3 ] . split ( "" ) ;

  // Initialize a counter for tracking specific conditions.
  var count      = 0 ;


  // Loop through the characters based on the parsed input number.
  for ( var i = 0 ; i < inputNum ; i++ )
  {
    // Condition 1: If all three characters at the current index are identical.
    // If true, no changes to 'count' are made, and the loop proceeds to the next iteration.
    if  (  firstList [ i ]  ==  secondList [ i ]  &&  secondList [ i ]  ==  thirdList [ i ]  )
    {
      continue ; // Skip remaining checks for this iteration.
    }

    // Condition 2: If any two of the three characters at the current index are identical.
    // This checks for partial matches.
    if  (  firstList [ i ]  ==  secondList [ i ]  ||  secondList [ i ]  ==  thirdList [ i ]  ||  thirdList [ i ]  ==  firstList [ i ]  )
    {
      count ++ ; // Increment count by one for a partial match.
      continue ; // Skip remaining checks for this iteration as a partial match is found.
    }

    // Condition 3: If none of the above conditions are met (i.e., all three characters are distinct).
    // In this case, 'count' is incremented twice.
    count ++ ;
    count ++ ;
  }

  // Output the final calculated count to the console.
  console . log ( count ) ;
}


// * DO NOT EDIT BELOW THIS LINE *
// This section handles reading input from standard input and invoking the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;