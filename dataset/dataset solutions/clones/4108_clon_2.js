"use strict"; /* This directive enforces stricter parsing and error handling in the code. */

// Function to process the input and find the solution.
const solveProblem = (  inputContent  ) => {
    // Trim whitespace and split the input string into lines.
    inputContent = inputContent.trim() .split("\n");

    // Parse the first line of input to extract required values.
    // The first value represents the total number of bills.
    const totalBillsExpected = ~~inputContent[0].split(" ")[0] ;
    // The second value represents the target monetary amount.
    const targetMonetaryValue = ~~inputContent[0].split(" ")[1] ;

    // Iterate through possible counts for the 10,000 yen bills.
    for ( let countOfTenThousands = 0; countOfTenThousands <= totalBillsExpected; countOfTenThousands++ ) {
        // Nested loop for possible counts of 5,000 yen bills.
        for  ( let countOfFiveThousands = 0; countOfFiveThousands <= totalBillsExpected; countOfFiveThousands++ )  {
            // Innermost loop for possible counts of 1,000 yen bills.
            for ( let countOfOneThousands = 0; countOfOneThousands <= totalBillsExpected; countOfOneThousands++ ) {

                // Calculate the total monetary value for the current combination of bills.
                let calculatedValue = (10000 * countOfTenThousands) + (5000 * countOfFiveThousands) + (1000 * countOfOneThousands);
                // Calculate the total number of bills for the current combination.
                let sumOfBills = ~~countOfTenThousands + ~~countOfFiveThousands + ~~countOfOneThousands;

                // Check if both the monetary value and the total number of bills match the targets.
                if ( targetMonetaryValue === calculatedValue && totalBillsExpected === sumOfBills ) {
                    // If a solution is found, print the counts of each bill type.
                    console.log(`${countOfTenThousands} ${countOfFiveThousands} ${countOfOneThousands}`);
                    return; // Exit the function as a solution has been found.
                }
            }
        }
    }

    // If no combination of bills satisfies the conditions after exhaustive search,
    // print -1 for all bill types to indicate no solution.
    console.log("-1 -1 -1");
};

// Read input from the standard input stream (e.g., from a file or console)
// and pass it to the main problem-solving function.
solveProblem(  require('fs').readFileSync('/dev/stdin', 'utf8')  );