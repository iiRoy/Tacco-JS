// This JavaScript program processes a command-line argument.
// It determines if the provided string is already in uppercase.

const alpha = process . argv [ 2 ] ; // Get the input string from command-line arguments.

// Convert the input string to its uppercase and lowercase forms.
const upper = alpha . toUpperCase ( ) ;
const lower = alpha . toLowerCase ( ) ; // This variable 'lower' is defined but not used in the logic.

// Perform a comparison to check the original case.
if ( alpha == upper )
{
  // If the original string matches its uppercase version,
  // it implies the string was already uppercase.
  console . log ( "A" ) ;
}
else
{
  // Otherwise, the string was not fully uppercase.
  // It could be lowercase or mixed case.
  console . log ( "a" ) ;
}

// End of the script.