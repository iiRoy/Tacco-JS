function Main ( input )
{
  // This function processes the given input to calculate a minimum value.

  // First, the input string is split into an array of strings,
  // with each element representing a line from the original input.
  input = input . split ( "\n" ) ;


  // Extract numerical values for H (Height) and W (Width)
  // from the first line of the input.
  // The '- 0' at the end converts the string to a number.
  const H = input [ 0 ] . split ( ' ' ) [ 0 ] - 0 ;
  const W = input [ 0 ] . split ( ' ' ) [ 1 ] - 0 ;


  // Initialize a variable 'min' to hold the minimum difference found.
  // It's set to Infinity initially to ensure any valid calculation will be smaller.
  var min = Infinity ;


  // Check for a specific edge case:
  // If either H or W is perfectly divisible by 3,
  // the minimum possible difference is 0.
  if ( H % 3 === 0 || W % 3 === 0 )
  {
    console . log ( 0 ) ; // Output 0.
    return ;              // Exit the function early as the answer is found.
  }


  // Initialize 'min' with the smaller of H and W.
  // This serves as an initial upper bound for the actual minimum difference.
  min = Math . min ( H , W ) ;


  // Evaluate possibilities based on H being even or odd.
  if ( H % 2 === 0 )
  {
    // If H is an even number,
    // update 'min' if H/2 yields a smaller value.
    min = Math . min ( min , H / 2 ) ;
  }
  else
  {
    // If H is an odd number,
    // calculate a specific value (H/2 + W/3 - 1/6) and compare it with 'min'.
    min = Math . min ( min , H / 2 + W / 3 - 1 / 6 ) ;
  }


  // Evaluate possibilities based on W being even or odd.
  if ( W % 2 === 0 )
  {
    // If W is an even number,
    // update 'min' if W/2 yields a smaller value.
    min = Math . min ( min , W / 2 ) ;
  }
  else
  {
    // If W is an odd number,
    // calculate a specific value (W/2 + H/3 - 1/6) and compare it with 'min'.
    min = Math . min ( min , W / 2 + H / 3 - 1 / 6 ) ;
  }


  // Finally, print the rounded integer value of the calculated minimum.
  console . log ( Math . round ( min ) ) ;

} // End of the Main function definition.

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));