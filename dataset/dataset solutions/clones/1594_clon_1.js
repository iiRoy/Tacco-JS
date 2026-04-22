/* Main function entry point */
function Main ( input )
{

  // Initialize counter variable 'j'
  let j = 0 ;


  // Check various input conditions to determine the value of 'j'
  if ( input == 'RRS' || input == 'SRR' )
  {
    j = 2 ; // Specific case 1: 'RRS' or 'SRR'
  }
  else if ( input == 'RRR' )
  {
    j = 3 ; // Specific case 2: 'RRR'
  }
  else if ( input == 'SSS' )
  {
    j = 0 ; // Specific case 3: 'SSS', resets j
  }
  else // Default handling for any other input string
  {
    j = 1 ; // Default case: for all other inputs
  }


  /* Output the final value of j to the console */
  console.log ( '%d' , j ) ;

} // End of Main function definition


// The following lines handle input/output and invoke the Main function.
// This section should typically remain untouched for standard execution in competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;