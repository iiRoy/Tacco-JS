/*
 * This JavaScript code represents a program that transforms an input character.
 * This is a Type I clone, meaning it's identical to the original
 * except for variations in whitespace and comments.
 * All core logic, identifiers, and operations remain unchanged.
 */
function Main /* The primary function that processes input */ ( input )
{
  // Start of the conditional block to check the input string value.
  // Each 'else if' statement checks for a specific character and
  // transforms it into the next character in the alphabet sequence.

  if ( input  ==  "a" )
  {
    input  =  "b" ; // If input is 'a', it becomes 'b'.
  }
  else if ( input  ==  "b" )
  {
    input  =  "c" ;
  }
  else if ( input  ==  "c" )
  {
    input  =  "d" ;
  }
  else if ( input  ==  "d" )
  {
    input  =  "e" ;
  }
  else if ( input  ==  "e" )
  {
    input  =  "f" ;
  }
  else if ( input  ==  "f" )
  {
    input  =  "g" ;
  }
  else if ( input  ==  "g" )
  {
    input  =  "h" ;
  }
  else if ( input  ==  "h" )
  {
    input  =  "i" ;
  }
  else if ( input  ==  "i" )
  {
    input  =  "j" ;
  }
  else if ( input  ==  "j" )
  {
    input  =  "k" ;
  }
  else if ( input  ==  "k" )
  {
    input  =  "l" ;
  }
  else if ( input  ==  "l" )
  {
    input  =  "m" ;
  }
  else if ( input  ==  "m" )
  {
    input  =  "n" ;
  }
  else if ( input  ==  "n" )
  {
    input  =  "o" ;
  }
  else if ( input  ==  "o" )
  {
    input  =  "p" ;
  }
  else if ( input  ==  "p" )
  {
    input  =  "q" ;
  }
  else if ( input  ==  "q" )
  {
    input  =  "r" ;
  }
  else if ( input  ==  "r" )
  {
    input  =  "s" ;
  }
  else if ( input  ==  "s" )
  {
    input  =  "t" ;
  }
  else if ( input  ==  "t" )
  {
    input  =  "u" ;
  }
  else if ( input  ==  "u" )
  {
    input  =  "v" ;
  }
  else if ( input  ==  "v" )
  {
    input  =  "w" ;
  }
  else if ( input  ==  "w" )
  {
    input  =  "x" ;
  }
  else if ( input  ==  "x" )
  {
    input  =  "y" ;
  }
  else if ( input  ==  "y" )
  {
    input  =  "z" ;
  }

  // The following line was commented out in the original source.
  // It demonstrates a potential wrap-around from 'z' to 'a'.
  /* else if ( input == "z" ) { input = "a" ; } */

  // After all checks and potential modifications, the final input value is logged.
  console . log ( input ) ;
}


// This section handles the execution of the Main function.
// It reads input from standard input (/dev/stdin) using Node.js's 'fs' module,
// decodes it as UTF-8, and then passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;