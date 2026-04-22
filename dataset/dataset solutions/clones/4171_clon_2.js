/*
 * This module processes a string of numbers to determine
 * how many times all numbers in a specific line can be
 * simultaneously divided by two before an odd number appears.
 *
 * @param {string} rawProblemString - The raw input string containing problem data.
 * @returns {number} The total count of successful halving steps.
 */
const determineHalvingSteps = ( rawProblemString ) => {

    let integerCollection = rawProblemString.split ( "\n" ) [ 1 ] .split ( " " ) .map ( strVal => parseInt ( strVal ) );

    let halvingAttempts = 0 ;

    while ( true ) {

        const isEveryElementEven = integerCollection . every ( currentInt => ( ( currentInt % 2 ) === 0 ) ) ;

        if ( isEveryElementEven ) {

            integerCollection = integerCollection . map ( originalNum => originalNum / 2 ) ;
            halvingAttempts ++ ;

        } else {

            return halvingAttempts ;

        }

    }
};

// Execute the core logic with data from standard input and display the outcome.
const finalOutputString = determineHalvingSteps ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
console . log ( finalOutputString ) ;