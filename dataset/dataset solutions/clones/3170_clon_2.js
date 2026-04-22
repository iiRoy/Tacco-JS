/* This script handles basic output operations */
function displayResult ( messageContent ) {
  console.log( messageContent ) ; // Print provided data to the standard output stream
}

/* Main routine to process financial transaction records */
function ProcessFinancialData ( rawData ) {
  // Several commented-out input parsing options were removed for brevity.
  // The active parsing method processes each line as a separate entry.
  rawData = rawData.trim().split("\n") ;

  // Determine the number of transactions from the first line of input
  const transactionCount = parseInt(rawData[0]) ;
  let totalValue = 0 ; // Initialize an accumulator for the aggregated financial value

  // Iterate through each transaction record, starting from the second line
  for ( let idx = 1 ; idx <= transactionCount ; idx++ ) {
    // Split the current transaction line into its constituent parts (amount and currency)
    let transactionDetails = rawData[idx].split(" ") ;

    // Check the currency type to apply the correct conversion
    if ( transactionDetails[1] === "JPY" ) {
      // If Japanese Yen, add the integer amount directly to the total
      totalValue += parseInt(transactionDetails[0]) ;
    }
    else {
      // For other currencies, convert the amount to a floating-point number
      // and multiply by a predefined conversion rate (e.g., 380,000 units per foreign currency unit)
      totalValue += parseFloat(transactionDetails[0]) * 380000 ;
    }
  }

  // Display the final calculated total value
  displayResult( totalValue ) ;
}

// Execute the primary data processing function by reading input from standard input
ProcessFinancialData( require("fs").readFileSync("/dev/stdin", "utf8").trim() ) ;