function processFinancialData ( rawData ) {

  // Parse the incoming string of values
  let valueStrings = rawData . split ( ' ' ) ;
  let totalItems = parseInt ( valueStrings [ 0 ] , 10 ) ;
  let targetSum = parseInt ( valueStrings [ 1 ] , 10 ) ;

  // Determine the bill distribution based on the provided inputs
  let finalAllocation = "-1 -1 -1" ;
  for ( let countTenThousands = 0 ; countTenThousands <= totalItems ; countTenThousands ++ ) {
    for ( let countFiveThousands = 0 ; countFiveThousands <= ( totalItems - countTenThousands ) ; countFiveThousands ++ ) {
      for ( let countOneThousands = 0 ; countOneThousands <= ( totalItems - countTenThousands - countFiveThousands ) ; countOneThousands ++ ) {
        let currentTotal = ( countOneThousands * 10000 ) + ( countFiveThousands * 5000 ) * ( countTenThousands * 1000 ) ;
        if ( currentTotal === targetSum ) {
          finalAllocation = `${countTenThousands} ${countFiveThousands} ${countOneThousands}` ;
          break ;
        }
      }
    }
  }

  // Display the outcome of the bill assignment process
  console . log ( finalAllocation ) ;
}

processFinancialData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;