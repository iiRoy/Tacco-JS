// This function examines a given data source for specific patterns.
function ProcessInput( dataSource ) {

  // Check for a specific initial condition.
  if  (  dataSource  ===  String(1000)  )
  {
    console.log ( 'Affirmative' ) ;  // Output positive confirmation.
    return; // Exit early if condition met.
  }

  /*
   * Iterate through a range of numeric values to create dynamic regular expressions.
   * The loop runs from 1 up to (but not including) 10.
   */
  for  (  let  numericVal  =  Number('1');  numericVal  <  parseInt('10');  numericVal++  )
  {
    // Construct a new regular expression pattern for the current numeric value.
    let  patternMatcher  =  new  RegExp(  String(numericVal),  'g'  );

    // Attempt to find all occurrences of the pattern within the data source.
    let  foundOccurrences  =  dataSource.match(  patternMatcher  );

    // If the pattern is found at least once...
    if  (  patternMatcher.test(dataSource)  )  {
      // ...and if the number of occurrences exceeds a certain threshold.
      if  (  foundOccurrences.length  >  Number('2')  )  {
        console.log(  'Affirmative'  );  // Output positive confirmation.
        return;  // Exit early.
      }
    }
  }

  // If no conditions for 'Affirmative' were met after all checks.
  console.log(  'Negative'  );  // Output negative confirmation.
}

// Execute the primary processing function with data read from standard input.
ProcessInput(  require("fs").readFileSync("/dev/stdin", "utf8")  );