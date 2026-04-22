/*
 * This JavaScript file contains a main function to process date-like strings
 * and a helper function to determine if a number represents a valid month or year part.
 * The goal is to classify the input string as MMYY, YYMM, AMBIGUOUS, or NA.
 */

function main(  input  ) {
    // Split the input string into an array of characters.
    var  data  =  input.split( "" );

    // Extract the first two characters for part A.
    var  A  =  data[0] + data[1];
    // Extract the next two characters for part B.
    var  B  =  data[2] + data[3];

    // Determine the type of part A using the IsYY helper function.
    // Number() converts the string part to a numeric value.
    var  judgeA  =  IsYY(Number(A));
    // Determine the type of part B.
    var  judgeB  =  IsYY(Number(B));

    // Variable to store the final classification result.
    var  result;

    /*
     * Helper legend for the interpretation of 'judge' values:
     * "2"  => Not a valid month (e.g., 0, >12) - treated as NA for date parts.
     * "1"  => Valid month (1-12) - could be MM or YY.
     * "0"  => Not a valid month, but could be a valid year (e.g., 13-99).
     *
     * Combinations (A is first part, B is second part):
     * A="2", B=?  => NA (A is invalid)
     * A=?, B="2"  => NA (B is invalid)
     * A="0", B="0" => NA (Both are invalid as months, and if they were years, it would be '0000' which is not handled as a valid year pair for this logic)
     * A="1", B="0" => MMYY (A is valid month, B is only valid as year)
     * A="0", B="1" => YYMM (A is only valid as year, B is valid month)
     * A="1", B="1" => AMBIGUOUS (Both can be months, implying both could be years too, leading to ambiguity)
     */

    // First, check for invalid or impossible combinations.
    if ( ( judgeA == "2" ) || ( judgeB == "2" ) || ( ( judgeA == "0" ) && ( judgeB == "0" ) ) ) {
        result = "NA"; // If either part is clearly invalid, or both are invalid as months.
    }
    // If A can be a month.
    else if ( judgeA == "1" ) {
        // If B can only be a year.
        if ( judgeB == "0" ) {
            result = "MMYY"; // A is month, B is year.
        }
        // If B can also be a month (and thus a year too).
        else {
            result = "AMBIGUOUS"; // Both A and B can be months, leading to ambiguity.
        }
    }
    // If A cannot be a month (but isn't "2", so it must be "0", meaning it can only be a year).
    else {
        // If B can be a month.
        if ( judgeB == "1" ) {
            result = "YYMM"; // A is year, B is month.
        }
        // If B cannot be a month (and isn't "2", so it must be "0", meaning it can only be a year).
        else {
            // This case (A="0", B="0") is already covered by the first 'if' condition.
            // This 'else' branch should theoretically not be reached if judgeA is "0" and judgeB is not "1".
            // However, for completeness or if logic was slightly different, it defaults to NA.
            result = "NA";
        }
    }

    // Output the determined classification.
    console.log( result );
}


/*
 * Helper function: Determines the "type" of a two-digit number.
 * @param {number} value - The numeric value to evaluate (e.g., 01, 12, 00, 13, 25).
 * @returns {string} - "2" if value is 0 (invalid for month/year interpretation in this context),
 *                     "1" if value is between 1 and 12 (inclusive, valid for month and year),
 *                     "0" if value is greater than 12 (valid only as a year).
 */
function IsYY(  value  ) {
    // If the value is exactly 0.
    if ( value == 0 ) {
        return "2"; // Special case: "00" is usually not a valid month/year for this problem.
    }
    // If the value falls within the range of valid months.
    else if ( ( 1 <= value ) && ( value <= 12 ) ) {
        return "1"; // Can be a month (MM) or a year (YY).
    }
    // If the value is greater than 12.
    else {
        return "0"; // Can only be a year (YY).
    }
}

// Read input from standard input, decode as UTF-8, and pass it to the main function.
main( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) );