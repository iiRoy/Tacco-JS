// This function processes an input string to find specific date patterns.
function ProcessDateAnalysis ( inputData )
{
    // Obtain the numerical value for the upper bound of months.
    let monthLimitVal = inputData . trim ( ) . split ( " " ) [ 0 ] - 0 ;
    // Obtain the numerical value for the upper bound of days.
    let dayLimitVal = inputData . trim ( ) . split ( " " ) [ 1 ] - 0 ;
    
    // Initialize a counter for specific date configurations.
    let foundCount = 0 ;

    // If the day limit is below the minimum valid day (22),
    // output zero and proceed to the final output.
    if (dayLimitVal < 22)
    {
        console.log(0);
    }

    // Iterate through potential month values, starting from 4.
    for ( let monthIterator = 4 ; monthIterator <= monthLimitVal ; monthIterator ++ )
    {
        // Iterate through potential day values, starting from 22.
        for ( let dayIterator = 22 ; dayIterator <= dayLimitVal ; dayIterator ++ )
        {
            // Extract the unit's place digit of the current day.
            let dayUnitsDigit = dayIterator . toString ( ) . split ( "" ) [ 1 ] ;
            // Extract the ten's place digit of the current day.
            let dayTensDigit = dayIterator . toString ( ) . split ( "" ) [ 0 ] ;
            
            // Check if the current month value equals the product of the day's digits.
            if (monthIterator === dayUnitsDigit * dayTensDigit)
            {
                foundCount ++ ; // Increment the counter if the condition is met.
            }
        }
    }
    
    // Output the final tally of matching date configurations.
    console.log(foundCount);
}

// Execute the analysis function with input read from standard input.
ProcessDateAnalysis ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;