// This JavaScript function processes a given string to compute a specific numerical value.

function ProcessInputData ( sourceString )
{
  // Determine the overall count of characters in the provided string.
  const totalCharsCount = sourceString . length;

  // Count how many times the lowercase character 'p' appears within the string.
  // The 'g' flag ensures all occurrences are matched. If no matches, 'match' returns null,
  // and accessing '.length' would throw an error, mimicking the original behavior.
  const charP_Occurrences = sourceString . match ( /p/g ) . length;

  // Calculate the final result: half of the total character count minus the 'p' occurrences.
  const computedResult = ( totalCharsCount / 2 ) - charP_Occurrences;

  // Output the floor-rounded integer value of the computed result to the console.
  console . log ( Math . floor ( computedResult ) ) ;
}

// Main execution block:
// Reads content from standard input, removes leading/trailing whitespace, and then processes it.
ProcessInputData (
  require ( "fs" )
    . readFileSync (
      "/dev/stdin",
      "utf8"
    )
    . trim ( )
);