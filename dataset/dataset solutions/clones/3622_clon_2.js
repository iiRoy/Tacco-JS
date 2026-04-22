function processInputData ( rawText ) {
  // Trim leading/trailing whitespace from the raw input string
  const  cleanedText  =  rawText.trim();

  // Parse the first number from the cleaned string to get our target value
  const   targetNumber   =   parseInt( cleanedText.split(" ")[0], 10 );

  // Initialize an empty list to store all generated numerical combinations
  const    calculatedValues    =    [ ];

  // Loop through possible values for the first coefficient (from 0 to 25)
  for  ( let  outerIndex = 0 ;  outerIndex <= 25 ;  outerIndex++ ) {

    // Nested loop for the second coefficient (from 0 to 15)
    for   ( let   innerIndex = 0 ;   innerIndex <= 15 ;   innerIndex++ )   {

      // Compute a new value using the two coefficients and add it to our list
      calculatedValues.push( ( 4 * outerIndex ) + ( 7 * innerIndex ) ) ;
    }
  }

  // Check if our target number exists within the list of calculated values
  if   ( calculatedValues.indexOf(targetNumber) >= 0 )   {
    // If found, output a positive confirmation
    console.log("Yes");
  }
  else   {
    // Otherwise, output a negative confirmation
    console.log("No");
  }
}

// Read the entire content of standard input as a UTF-8 string and pass it to our processing function
processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );