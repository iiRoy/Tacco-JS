function myin ( )
{
  // This function reads input from standard input.
  return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ;
}


function myout ( t )
{
  /*
   *  This function is responsible for printing output to the console.
   *  It takes one argument 't' which is the value to be displayed.
   */
  console . log ( t ) ;
}



// Conversion utility function:
// [no] parameter guide:
//   0 : No conversion, return as is.
//   1 : Convert to integer (parse as base 10).
//   2 : Split by single space character.
//   3 : Split by newline character.
//   4 : Split by space, then convert each part to a number.
//   5 : Split by newline, then convert each part to a number.
//   6 : Split into individual characters.
//   7 : Split into individual characters, then convert each to a number.
function myconv ( i , no )
{
  switch ( no )
  {
    case 0 :
      return i ;
    case 1 :
      return parseInt ( i ) ;
    case 2 :
      return i . split ( " " ) ;
    case 3 :
      return i . split ( "\n" ) ;
    case 4 :
      return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
    case 5 :
      return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;
    case 6 :
      return i . split ( "" ) ;
    case 7 :
      return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
  }
}



function Main ( input )
{
  // Initialize a counter array; its size is one greater than the input length.
  var counter = new Array ( input . length + 1 ) ;

  // Convert the input string into an array of individual characters.
  input = myconv ( input , 6 ) ;

  // Check the first character of the input.
  if ( input [ 0 ] == "<" )
  {
     counter [ 0 ] = 0 ; // If it's '<', set the first counter element to 0.
  }

  // Check the last character of the input.
  if ( input [ input . length - 1 ] == ">" )
  {
     counter [ input . length ] = 0 ; // If it's '>', set the last counter element to 0.
  }

  // Loop through the input characters to identify specific patterns.
  for ( var i = 1 ; i < input . length ; i++ )
  {
    var mae = input [ i - 1 ] ; // Character before the current position.
    var ato = input [ i ] ;     // Character at the current position.

    if ( mae == ">" && ato == "<" )
    {
       counter [ i ] = 0 ; // If pattern is "><", set counter at 'i' to 0.
    }
    else if ( mae == "<" && ato == ">" )
    {
       counter [ i ] = "x" ; // If pattern is "<>", mark with "x" for special handling.
    }
  }

  // Debugging line, commented out: myout(counter);

  var sum = 0 ; // Variable to store the final sum.
  var tmp = 0 ; // Temporary variable, though not used in the final code logic.

  // Second pass to fill in the counter array values based on rules.
  for ( var i = 0 ; i < counter . length ; i++ )
  {
    if ( i == 0 )
    {
       if ( counter [ 0 ] == null )
       {
          counter [ 0 ] = 1 ; // If the first element is still null, set it to 1.
       }
      continue ; // Skip to the next iteration.
    }

    if ( counter [ i ] == 0 )
    {
    	continue ; // If current element is 0, skip, it's already correctly set.
    }

    if ( counter [ i - 1 ] == 0 )
    {
       counter [ i ] = 1 ; // If the previous element was 0, current element starts at 1.
    }
    else if ( counter [ i ] == "x" )
    {
      counter [ i ] = counter [ i - 1 ] + 1 ; // If "x", it's previous + 1.
      if ( counter [ i + 1 ] != 0 )
      {
      	counter [ i + 1 ] = 1 ; // If the next element is not 0, set it to 1.
      }
      i++ ; // Increment 'i' to skip the next element which was just handled.
      continue ;
    }
    else
    {
      counter [ i ] = counter [ i - 1 ] + 1 ; // Default: current = previous + 1.
    }

  }

  // Calculate the total sum of all values in the counter array.
  for ( var i = 0 ; i < counter . length ; i++ )
  {
    sum += counter [ i ] ;
  }

  // Another commented out debug line: myout(counter);

  // Output the final calculated sum.
  myout ( sum ) ;
}


// Call the Main function with input read from standard input.
Main ( myin ( ) ) ;