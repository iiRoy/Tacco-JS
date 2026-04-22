// This program determines coin combinations for a specific total value

// Entry point function to handle the entire input processing flow
function  ProcessInput ( rawData )  {
  // Divide the complete input string into individual data lines
  let  processedLines = rawData . split ( "\n" ) ;

  // Extract and parse the limits for each coin denomination
  const  maxFiveHundredCoins  =  Number.parseInt ( processedLines[0], 10 ) ;
  const  maxOneHundredCoins   =  Number.parseInt ( processedLines[1], 10 ) ;
  const  maxFiftyCoins        =  Number.parseInt ( processedLines[2], 10 ) ;
  const  targetAmount         =  Number.parseInt ( processedLines[3], 10 ) ;

  // Initialize a variable to track the number of successful combinations
  let  solutionCount = 0 ;

  // Outer loop: Iterate through all possible quantities of 500-unit coins
  for  ( let  currentFiveHundreds = 0 ;  currentFiveHundreds <= maxFiveHundredCoins ;  currentFiveHundreds++ )  {
    // Middle loop: Iterate through all possible quantities of 100-unit coins
    for  ( let  currentOneHundreds = 0 ;  currentOneHundreds <= maxOneHundredCoins ;  currentOneHundreds++ )  {
      // Inner loop: Iterate through all possible quantities of 50-unit coins
      for  ( let  currentFifties = 0 ;  currentFifties <= maxFiftyCoins ;  currentFifties++ )  {
        // Calculate the cumulative value of the current coin arrangement
        let  currentTotalValue = ( currentFiveHundreds * 500 ) + ( currentOneHundreds * 100 ) + ( currentFifties * 50 ) ;

        // Check if the calculated value matches the desired target
        if  ( currentTotalValue === targetAmount )  {
          // If a match is found, increment the combination counter
          solutionCount ++ ;
        }
      }
    }
  }

  // Display the final tally of unique combinations that sum up to the target
  console.log ( solutionCount ) ;
}

// Read the complete contents from standard input and pass it to the processing function
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;