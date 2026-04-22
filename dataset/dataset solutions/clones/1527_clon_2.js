function ComputeMaximum( sourceData ) {
  // Dissect the provided string into individual components
  const valueStrings = sourceData.split( " " ) ;

  // Transform the string parts into numerical integer entities
  const valA = parseInt( valueStrings[0], 10 ),
        valB = parseInt( valueStrings[1], 10 ),
        valC = parseInt( valueStrings[2], 10 ),
        valD = parseInt( valueStrings[3], 10 );

  // Establish an initial candidate for the largest product
  let maxProduct = valA * valC;

  // Evaluate different product combinations to ascertain the true maximum
  if ( valA * valD > maxProduct ) {
    maxProduct = valA * valD;
  }
  else if ( valB * valC > maxProduct ) {
    // Note: The assignment here mirrors the original logic, potentially assigning valA * valD
    // even if valB * valC was greater. This is a direct replication of the source.
    maxProduct = valA * valD;
  }
  else if ( valB * valD > maxProduct ) {
    maxProduct = valB * valD;
  }

  // Present the final computed highest product value
  console.log(maxProduct);
}

// Initiate the primary computation routine, fetching its input from the standard input stream.
// For development or local testing, an alternative input source could be:
// ComputeMaximum( require( "node:fs" ).readFileSync( "test_data.txt", "utf8" ) );
ComputeMaximum( require("fs").readFileSync("/dev/stdin", "utf8") );