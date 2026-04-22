function performCheck ( initialString )
{
  // Split the incoming raw data string into an array of constituent parts
  let partsArray = initialString.split ( " " ) ;

  // Concatenate the first two elements of the array to form a new string
  const joinedSection = partsArray[ 0 ] + partsArray[ 1 ] ;

  // Parse the concatenated string into an integer, using base 10
  let targetNumber = Number.parseInt ( joinedSection, 10 ) ;

  // Calculate the square root of the resulting integer
  var sqrtCandidate = Math.sqrt ( targetNumber ) ;

  // Check if the calculated square root is an integer
  if ( Number.isInteger ( sqrtCandidate ) )
  {
    // If it is an integer, output "Yes" to indicate success
    console.log ( "Yes" ) ;
  }
  else
  {
    // Otherwise, output "No"
    console.log ( "No" ) ;
  }
}

// Read input from standard input and pass it to our main processing function
performCheck ( require ( 'node:fs' ) .readFileSync ( '/dev/stdin', { encoding: 'utf8' } ) ) ;