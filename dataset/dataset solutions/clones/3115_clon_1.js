function  myin (  )  {
  /* This function is responsible for reading input from standard input.
   * It uses the 'fs' module to read the file at /dev/stdin,
   * converts it to a UTF-8 string, and then removes leading/trailing whitespace.
   */
  return  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . trim ( ) ;
}


function  myout ( t )
{
  // This function prints the given argument 't' to the standard output.
  console . log ( t ) ;
}


function  myerr (  t  )
{
  /* Error logging utility:
   * Displays messages to the standard error stream.
   */
  console . error (  t  ) ;
}


/*
 * myconv conversion types:
 * 0: No conversion, return as-is
 * 1: Convert to integer (parseInt)
 * 2: Split by half-width space
 * 3: Split by newline
 * 4: Split by half-width space, then convert each part to Number
 * 5: Split by newline, then convert each part to Number
 * 6: Split into individual characters
 * 7: Split into individual characters, then convert each to Number
 */
function  myconv (  i  ,  no  )
{
  switch (  no  )
  {
    case  0  :
      return  i  ;
    case  1  :
      return  parseInt (  i  )  ;
    case  2  :
      return  i . split (  " "  )  ;
    case  3  :
      return  i . split (  "\n"  )  ;
    case  4  :
      return  i . split (  " "  ) . map (  ( a )  =>  Number ( a )  )  ;
    case  5  :
      return  i . split (  "\n"  ) . map (  ( a )  =>  Number ( a )  )  ;
    case  6  :
      return  i . split (  ""  )  ;
    case  7  :
      return  i . split (  ""  ) . map (  ( a )  =>  Number ( a )  )  ;
  }
}



function  Main (  input  )
{

  // Convert the input string to an integer using myconv with option 1.
  input  =  myconv (  input  ,  1  )  ;


  if (  input  ==  3  )
  {
    // Special case for input value 3.
    myout (  "2\n1 3\n2 3"  )  ;
    return  ;
  }


  if (  input  ==  4  )
  {
    // Another special case for input value 4.
    myout (  "4\n1 3\n2 1\n4 2\n3 4"  )  ;
    return  ;
  }


  var  output  =  [  ]  ; // Initialize an empty array to store output lines.


  // Check if the input number is odd.
  if (  input  %  2  ==  1  )
  {
    // For odd input values.
    output . push (  ( input  -  1 )  *  2  )  ; // First line of output.

    // Loop for generating connections.
    for (  var  i  =  0  ;  i  <  Math . floor (  input  /  2  )  ;  i ++  )
    {
      var  mae  =  i  +  1  ;
      var  mae2  =  mae  +  1  ;
      var  ato  =  input  -  1  -  i  ;
      var  ato2  =  ato  -  1  ;

      // Conditional logic for specific iterations of the loop.
      if (  i  ==  Math . floor (  input  /  2  )  -  1  ||  i  ==  0  )
      {
        output . push (  mae . toString (  )  +  " "  +  input  )  ;
        output . push (  ato . toString (  )  +  " "  +  input  )  ;

        if (  i  ==  Math . floor (  input  /  2  )  -  1  )
        {
          break  ; // Exit the loop if this condition is met.
        }
      }

      // Add various connections to the output array.
      output . push (  mae . toString (  )  +  " "  +  mae2 . toString (  )  )  ;
      output . push (  mae . toString (  )  +  " "  +  ato2 . toString (  )  )  ;
      output . push (  ato . toString (  )  +  " "  +  mae2 . toString (  )  )  ;
      output . push (  ato . toString (  )  +  " "  +  ato2 . toString (  )  )  ;
    }

    // Join all output lines with newline characters and print them.
    myout (  output . join (  "\n"  )  )  ;
  }
  else
  {
    // For even input values.
    output . push (  input  *  2  )  ; // First line of output for even numbers.

    // Loop for generating connections for even numbers.
    for (  var  i  =  0  ;  i  <  input  /  2  ;  i ++  )
    {
      var  mae  =  i  +  1  ;
      var  mae2  =  mae  +  1  ;
      var  ato  =  input  -  i  ;
      var  ato2  =  ato  -  1  ;

      // Special adjustment for the last iteration.
      if (  i  ==  (  input  /  2  )  -  1  )
      {
        mae2  =  1  ;
        ato2  =  input  ;
      }

      // Add connections to the output array.
      output . push (  mae . toString (  )  +  " "  +  mae2 . toString (  )  )  ;
      output . push (  mae . toString (  )  +  " "  +  ato2 . toString (  )  )  ;
      output . push (  ato . toString (  )  +  " "  +  mae2 . toString (  )  )  ;
      output . push (  ato . toString (  )  +  " "  +  ato2 . toString (  )  )  ;
    }

    // Join and print the output.
    myout (  output . join (  "\n"  )  )  ;
  }
}


// Call the Main function with the input read by myin().
Main (  myin (  )  )  ;