function AnalyzeDimensions ( rawInputData )
{
  // The input is provided as a single text block.
  // We first parse it into an array of individual text lines.
  const dataLines = rawInputData.split ( "\n" );

  // The first line holds space-separated dimension values.
  const dimStringsOne = dataLines [ 0 ] .split ( " " );

  // The second line also contains space-separated dimension values.
  const dimStringsTwo = dataLines [ 1 ] .split ( " " );

  // Extracting the row count for the main area from the first set.
  const primaryHeight = dimStringsOne [ 0 ];

  // Extracting the column count for the main area from the first set.
  const primaryWidth = dimStringsOne [ 1 ];

  // Retrieving the row count for the sub-component from the second set.
  const secondaryHeight = dimStringsTwo [ 0 ];

  // Retrieving the column count for the sub-component from the second set.
  const secondaryWidth = dimStringsTwo [ 1 ];

  // Compute the resultant value by subtracting corresponding dimensions
  // and then multiplying the differences.
  const finalCalculatedValue = ( primaryHeight - secondaryHeight ) * ( primaryWidth - secondaryWidth );

  // Print the computed numerical result to the standard output.
  console.log ( finalCalculatedValue );
}


// This trailing section handles the environment-specific input/output.
// It should typically remain untouched to ensure proper execution.
AnalyzeDimensions ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) );