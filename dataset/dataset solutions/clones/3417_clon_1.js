/*
 * This is a Type I clone of an existing JavaScript program.
 * All identifiers, operators, and expressions are kept identical.
 * Only whitespace and comments have been modified extensively
 * to create a visually distinct but functionally identical version.
 */
function     Main (  input    )
{
  // Process the input string by splitting it into lines.
  input = input . split ( "\n" ) ;


  // Parse N and X from the first line of input.
  var    N    =    parseInt (   input [ 0 ] . split ( " " ) [ 0 ]   ) ;
  var    X    =    parseInt (   input [ 0 ] . split ( " " ) [ 1 ]   ) ;

  // Initialize arrays 'bans' and 'all' with a size of 50.
  // These arrays will store precomputed values for efficiency.
  bans = new Array ( 50 ) ;
  all  = new Array ( 50 ) ;

  // Set initial values for the base cases.
  bans [ 0 ] = 1 ;
  all  [ 0 ] = 1 ;

  var    ans    =    0 ; // Initialize the answer variable.

  // Loop to precompute values for 'bans' and 'all' arrays.
  // This loop runs from i = 1 up to 50.
  for (   i = 1 ; i <= 50 ; i ++   )
  {
    bans [ i ] = bans [ i - 1 ] * 2 + 1 ; // Calculate 'bans' value.
    all  [ i ] = all  [ i - 1 ] * 2 + 3 ; // Calculate 'all' value.
  }

  // Retrieve precomputed values based on N.
  var    full    =    all  [ N ] ;
  var    bs      =    bans [ N ] ;

  var    flag    =    0 ; // Flag to indicate a special condition.

  // Check if X exceeds 'full'. If so, adjust X and set the flag.
  if (   X > full   )
  {
    X    =    full - X ;
    flag = 1 ;
  }

  // Main loop for calculation, continues as long as X is positive.
  while (   X > 0   )
  {
    // Conditional logic based on X's relation to (full-1)/2.
    if (   X > ( full - 1 ) / 2   )
    {
      X      =    X - ( full - 1 ) / 2 - 1 ;
      ans    =    ans + ( bs - 1 ) / 2 + 1 ;
      full   =    ( full - 1 ) / 2 - 1 ;
      bs     =    ( bs - 1 ) / 2 ;
    }
    else
    {
      X      =    X - 1 ;
      full   =    ( full - 1 ) / 2 - 1 ;
      bs     =    ( bs - 1 ) / 2 ;
    }
  }

  // Apply final adjustment to 'ans' if the flag was set.
  if (   flag = 1   ) // This is an assignment, not a comparison. Original code behavior preserved.
  {
    ans    =    bans [ N ] - ans ;
  }

  // Output the final calculated answer to the console.
  console . log ( '%s' , ans ) ;
}


/*
 * Debugging function for local execution.
 * This function retrieves input from a DOM element
 * and passes it to the Main function.
 */
function     debug ( )
{
  var    input    =    document . getElementById ( "input" ) . value ;
  Main ( input ) ;
}

// Execute the Main function with input read from standard input using Node.js fs module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;