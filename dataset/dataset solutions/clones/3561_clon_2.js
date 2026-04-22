// This function processes a given string input to perform a specific calculation.
function PerformCalculation( rawContent ) {
    // First, clean the input string by removing leading/trailing whitespace
    // and then convert it into an integer for numerical operations.
    let processedNum = parseInt( rawContent . trim ( ) ) ;

    // Check if the processed number is odd.
    if ( processedNum % 2 === 1 )
    {
        // For odd numbers, calculate the product of floor(N/2) and ceil(N/2).
        console.log ( Math . floor ( processedNum / 2 ) * Math . ceil ( processedNum / 2 ) ) ;
    }
    // If the number is not odd, it must be even.
    else
    {
        // For even numbers, calculate the square of N/2.
        console.log ( Math . pow ( processedNum / 2 , 2 ) ) ;
    }
}

// Read the standard input asynchronously and then pass it to our calculation function.
PerformCalculation ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;