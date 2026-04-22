/*
 * This program calculates the number of days until the
 * next Sunday, given the current day of the week as
 * a string.
 *
 * Input:
 *   S - A string representing the current day.
 *       Valid values for S are:
 *       "SUN" (Sunday)
 *       "MON" (Monday)
 *       "TUE" (Tuesday)
 *       "WED" (Wednesday)
 *       "THU" (Thursday)
 *       "FRI" (Friday)
 *       "SAT" (Saturday)
 *
 * Output:
 *   An integer representing the number of days until
 *   the next Sunday.
 *
 * Constraints:
 *   The input string S will always be one of the
 *   specified valid day abbreviations.
 *
 * Example:
 *   If S is "WED", the output should be 4 (WED -> THU -> FRI -> SAT -> SUN).
 *
 */


function   Main (   input   )   {


    // Split the input string by newline to get the day of the week.
    // In this specific problem, input is usually just one line.
    var   S   =   input . split ( '\n' ) ;


    // Define a mapping from day abbreviation to the number of days
    // until the next Sunday.
    // SUN: 7 days (next Sunday is 7 days away, effectively today + 7)
    // MON: 6 days
    // TUE: 5 days
    // WED: 4 days
    // THU: 3 days
    // FRI: 2 days
    // SAT: 1 day
    var   map   =   {
        "SUN"   :   7 ,   // Sunday -> 7 days until next Sunday
        "MON"   :   6 ,   // Monday -> 6 days until next Sunday
        "TUE"   :   5 ,   // Tuesday -> 5 days until next Sunday
        "WED"   :   4 ,   // Wednesday -> 4 days until next Sunday
        "THU"   :   3 ,   // Thursday -> 3 days until next Sunday
        "FRI"   :   2 ,   // Friday -> 2 days until next Sunday
        "SAT"   :   1 ,   // Saturday -> 1 day until next Sunday
    } ;


    // Retrieve the value from the map using S as the key and print it.
    // Note: S here is the array from split, so S[0] would be the actual day string.
    // The original code uses map.S, which would look for a property named "S"
    // rather than using the *value* of the S variable (which is an array).
    // Assuming the intent was map[S[0]] or that S was just the string directly.
    // Sticking to the original code's exact structure for Type I.
    console . log (   map . S   ) ;


}


// This section is for handling standard input/output.
// It is typically provided as boilerplate and should not be modified.
// It reads the entire standard input, converts it to UTF-8,
// and then calls the Main function with the content.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;