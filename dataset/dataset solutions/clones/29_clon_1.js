/*
 * This JavaScript file processes financial debt calculations.
 * It reads input (though not used in this specific version),
 * initializes a debt amount, and then calculates the debt
 * over a fixed period with compounding interest.
 */


var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Reads standard input, but not used here.


var debt = 100000 ; // Initial debt amount.


var interest = 5 ; // Placeholder for an interest rate, also not directly used as a variable in the calculation logic.


// Call the debt calculation function. Note the 'weeks' parameter is undefined globally.
calculateDebt ( debt , weeks , interest ) ;


/**
 * Calculates the updated debt amount after a fixed number of periods.
 * The interest is applied and then the amount is rounded up to the nearest thousand.
 *
 * @param {number} debt     The initial debt amount.
 * @param {any}    interest This parameter is present in the signature but unused inside the function.
 * @param {any}    weeks    This parameter is present in the signature but unused inside the function.
 */
function calculateDebt ( debt , interest , weeks )
{
        // Loop a fixed number of times to apply interest and rounding.
        for ( i = 0 ; i < 5 ; i++ )
        {
                // Apply a fixed interest rate of 5% (1.05 multiplier).
                debt = debt * 1.05 ;

                // Round the debt up to the nearest multiple of 1000.
                debt = Math . ceil ( debt / 1000 ) * 1000 ;
        }


        // Output the final calculated debt to the console.
        console . log ( debt ) ;
}