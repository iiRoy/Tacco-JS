// This is the primary function that processes the given input data.
function       Main ( input )
{
    // The raw input string is first broken down into an array of lines,
    // using the newline character as a delimiter.
    input = input.split( "\n" ) ;


    // The first line of the input (at index 0) is parsed as an integer
    // and stored in the variable 'N'. The radix 10 is specified for decimal parsing.
    var    N    =    parseInt( input[0] ,    10 ) ;

    // A new variable 'n' is calculated by dividing 'N' by 2.
    // This 'n' likely represents half the length of something.
    var n = N / 2 ;


    // The second line of the input (at index 1) is taken directly
    // as a string and assigned to the variable 'S'.
    var S = input[1] ;


    // This conditional statement checks a property of 'N'.
    // The expression `!N % 2 === 0` is somewhat unusual.
    // Due to operator precedence, it evaluates `N % 2` first.
    // If N is odd, `N % 2` is 1. Then `!1` is `false`. `false === 0` is `false`.
    // If N is even, `N % 2` is 0. Then `!0` is `true`. `true === 0` is `false`.
    // Therefore, this `if` condition will always evaluate to `false`,
    // making the `console.log('No');` inside this block unreachable.
    if ( !N % 2    ===    0 )
    {
      // This line will practically never be executed under normal circumstances
      // given the logic of the preceding condition.
      console.log( 'No' ) ;
    }
    // If the above condition is not met (which it won't be),
    // the code execution proceeds to this 'else' block.
    else
    {
      // An empty array named 'str' is initialized.
      // This array will be used to store parts of the string 'S'.
      var str = [] ;

      // A loop iterates to divide the string 'S' into segments.
      // The loop runs `S.length / n` times. If S.length is N and n is N/2,
      // this means the loop will run 2 times, effectively splitting S into two halves.
      for ( var i = 0 ; i < S.length / n ; i++ )
      {
          // In each iteration, a substring of 'S' is extracted.
          // It starts at index `i * n` and has a length of `n`.
          // This substring is then added to the 'str' array.
          str.push( S.substr( i * n , n ) ) ;
      }

      // The following line was likely a debug statement,
      // which has been commented out.
      // console.log(str);


      // After populating the 'str' array, this condition checks
      // if the first element of 'str' is strictly equal to its second element.
      // This effectively compares the two halves of the original string 'S'.
      if ( str[0] === str[1] )
      {
          // If the two halves are identical, the program prints 'Yes' to the console.
          console.log( 'Yes' ) ;
      }
      else
      {
          // Otherwise, if the two halves are different, it prints 'No'.
          console.log( 'No' ) ;
      }
    }
}
/*
 * The following section is responsible for handling standard input/output operations.
 * It reads the entire content from standard input and then passes it to the 'Main' function.
 * This part should typically not be modified by users solving coding challenges.
 */
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;