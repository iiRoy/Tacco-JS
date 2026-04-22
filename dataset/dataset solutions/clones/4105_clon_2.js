'use strict';
/*
 * This module is designed to identify a specific combination of Japanese bills
 * (10,000 yen, 5,000 yen, and 1,000 yen) that sum up to a target amount
 * while adhering to a maximum total number of bills.
 */
function findCurrencyCombination ( inputStringData ) {
  // Parse the incoming string data into individual components
  const parsedValues = inputStringData.split ( ' ' ) ;

  // Extract the total number of bills allowed (N)
  const totalBills = parsedValues [ 0 ] ;

  // Extract the desired total monetary sum (Y)
  const targetSum = parsedValues [ 1 ] ;

  // Begin iterating through all possible counts for 10,000 yen notes
  for ( let countTenThousands = 0 ; countTenThousands <= totalBills ; countTenThousands ++ ) {
    // Calculate the amount remaining after accounting for the 10,000 yen notes
    const remainingAmount = targetSum - ( 10000 * countTenThousands ) ;

    // Check if the remaining amount is zero and all bills are 10,000 yen notes
    if ( remainingAmount === 0 && totalBills == countTenThousands ) {
      return console.log ( totalBills , 0 , 0 ) ;
    }
    // If the remaining amount is negative or zero, and there are still other bills to try,
    // it means this path won't lead to a solution with fewer 10,000 yen notes
    else if ( remainingAmount <= 0 && countTenThousands < totalBills ) {
      break ;
    }

    // Now, iterate through possible counts for 5,000 yen notes for the current remaining amount
    for ( let countFiveThousands = 0 ; countFiveThousands <= ( totalBills - countTenThousands ) ; countFiveThousands ++ ) {
      // Determine the number of 1,000 yen notes required to meet the total bill count
      const countThousands = totalBills - countTenThousands - countFiveThousands ;

      // Calculate the final balance by subtracting the value of 5,000 and 1,000 yen notes
      const finalBalance = remainingAmount - ( 5000 * countFiveThousands ) - ( 1000 * countThousands ) ;

      // If the final balance is exactly zero, a valid combination has been found
      if ( finalBalance === 0 ) {
        return console.log ( countTenThousands , countFiveThousands , countThousands ) ;
      }
      // If the final balance is less than 1,000, it means we cannot make up the difference
      // with 1,000 yen notes or any smaller denomination (which are not available),
      // so we can break from this inner loop.
      else if ( finalBalance < 1000 ) {
        break ;
      }
    }
  }

  // If no valid combination was found after exhausting all possibilities
  return console.log ( -1 , -1 , -1 ) ;
}

// Read input from standard file system and execute the money calculation
const fileSystemModule = require ( 'fs' ) ;
const rawInputData = fileSystemModule.readFileSync ( 0 , 'utf8' ) ;
findCurrencyCombination ( rawInputData ) ;