// This routine processes the entire provided raw input string.
function ProcessInputData(rawData)
  {
    // Break down the raw input string into an array of individual lines.
    const dataLines = rawData.split("\n") ;

    // Parse the first line to extract the numerical length of the sequences.
    const sequenceLength = Number.parseInt(dataLines[0], 10) ;

    // Divide the subsequent lines into character arrays for individual sequence access.
    const sequenceOne = dataLines[1].split("") ;
    const sequenceTwo = dataLines[2].split("") ;
    const sequenceThree = dataLines[3].split("") ;

    // Initialize counters to track dissimilarities between pairs of sequences.
    let diffsOneTwo = 0 ;
    let diffsOneThree = 0 ;
    let diffsTwoThree = 0 ;

    // Iterate through each character position across all sequences.
    for ( let currentIdx = 0; currentIdx < sequenceLength; currentIdx++ )
    {
      // Determine if the characters at the current index differ between sequence One and sequence Two.
      if ( sequenceOne[currentIdx] !== sequenceTwo[currentIdx] )
      {
        diffsOneTwo++ ;
      }

      // Determine if the characters at the current index differ between sequence One and sequence Three.
      if ( sequenceOne[currentIdx] !== sequenceThree[currentIdx] )
      {
        diffsOneThree++ ;
      }

      // Determine if the characters at the current index differ between sequence Two and sequence Three.
      if ( sequenceTwo[currentIdx] !== sequenceThree[currentIdx] )
      {
        diffsTwoThree++ ;
      }
    }

    // Compute the aggregate differences associated with each primary sequence.
    const totalForFirst = diffsOneTwo + diffsOneThree ;
    const totalForSecond = diffsOneTwo + diffsTwoThree ;
    const totalForThird = diffsOneThree + diffsTwoThree ;

    // Print out the smallest calculated total difference.
    console.log('%d', Math.min(totalForFirst, totalForSecond, totalForThird)) ;
  }

// This section handles standard input/output operations and must remain unaltered for execution.
ProcessInputData( require("node:fs").readFileSync("/dev/stdin", "utf8") ) ;