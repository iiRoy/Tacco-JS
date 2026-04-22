// This function processes all input data provided.
function ProcessFinancialData ( rawData )
{

  // Each line of input is separated, then the first line is tokenized.
  let lineData = rawData.split( "\n" );
  let firstLineTokens = lineData[0].split( " " );

  // Numerical conversion from string representation is done using parseInt.
  const totalBillsCount = parseInt( firstLineTokens[0], 10 );
  const targetSumAmount = parseInt( firstLineTokens[1], 10 );

  let countTenThousands = -1;
  let countFiveThousands = -1;
  let countThousands = -1;

  // Calculate the maximum possible number of 10,000 yen bills.
  let maxTenThousandsPossible = targetSumAmount / 10000;

  for ( let idxTenK = 0; idxTenK <= maxTenThousandsPossible; idxTenK++ )
  {
    for ( let idxFiveK = 0; idxFiveK <= totalBillsCount - idxTenK; idxFiveK++ )
    {
      if ( targetSumAmount === idxTenK * 10000 + idxFiveK * 5000 + ( totalBillsCount - idxTenK - idxFiveK ) * 1000 )
      {
        countTenThousands = idxTenK;
        countFiveThousands = idxFiveK;
        countThousands = totalBillsCount - idxTenK - idxFiveK;
      }
    }
    // If a valid combination is found, exit the outer loop.
    if ( countTenThousands !== -1 )
    {
      break;
    }
  }

  // Display the final counts.
  console.log( countTenThousands + " " + countFiveThousands + " " + countThousands );
}
// Do not modify the following line (it handles standard input/output and calls the main processing function).
ProcessFinancialData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );