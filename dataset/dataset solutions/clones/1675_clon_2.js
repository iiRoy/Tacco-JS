process . stdin . resume ( ) ;

process . stdin . setEncoding ( 'utf8' ) ;

// This program processes standard input to calculate
// specific cubic sum combinations for a range of values.

let dataLines = [ ] ;

const inputHandler = require ( 'readline' ) . createInterface ( {
    input : process . stdin ,
    output : process . stdout
} ) ;

inputHandler . on ( 'line' , ( currentLineText ) => {
    dataLines . push ( currentLineText ) ;
} ) ;

inputHandler . on ( 'close' , ( ) => {

    const maxIterationValue = Number . parseInt ( dataLines [ 0 ] , 10 ) ;

    let combinationCount = 0 ;

    // Function to determine combinations that sum to a target value
    function calculateCubicSumCombinations ( targetSumValue )
    {
        for ( let firstTerm = 1 ; firstTerm <= 100 ; firstTerm ++ )
        {
            for ( let secondTerm = 1 ; secondTerm <= 100 ; secondTerm ++ )
            {
                for ( let thirdTerm = 1 ; thirdTerm <= 100 ; thirdTerm ++ )
                {
                    // Check if the specific cubic sum matches the target
                    if ( firstTerm * firstTerm + thirdTerm * thirdTerm + secondTerm * secondTerm +
                         firstTerm * thirdTerm + secondTerm * firstTerm + thirdTerm * secondTerm ===
                         targetSumValue )
                    {
                        combinationCount ++ ;
                    }
                }
            }
        }
    }


    // Iterate from 1 up to the maximum value provided by input
    for ( let outerLoopIterator = 1 ; outerLoopIterator <= maxIterationValue ; outerLoopIterator ++ )
    {
        calculateCubicSumCombinations ( outerLoopIterator ) ;
        console . log ( combinationCount ) ;
        // Reset the counter for the next iteration
        combinationCount = 0 ;
    }

} ) ;