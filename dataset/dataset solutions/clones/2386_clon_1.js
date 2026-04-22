// This script processes a day of the week string and outputs a numerical value.
// It reads input from standard input, typically used in competitive programming.
var     input   =   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   ;


/*
 * The variable 'S' stores the input string.
 * This string is expected to be one of the three-letter day abbreviations.
 */
var S = input;


// Define an array containing the names of the days of the week.
// This array is used to find the position of the input day.
var weeks =
[
    'SUN',  // Sunday, the traditional first day of the week.
        'MON',  /* Monday, the beginning of the work week. */
    'TUE',      // Tuesday, often considered the second day.
        'WED', /* Wednesday, the middle of the standard week. */
    'THU',      // Thursday, almost the weekend.
        'FRI',  /* Friday, the last day of the work week. */
    'SAT',       // Saturday, the first day of the weekend.
]   ;


// Calculate the final result.
// 1. 'weeks.reverse()' reverses the array to change the order of search.
// 2. 'indexOf(S)' finds the 0-based index of the input day in the *reversed* array.
// 3. '+ 1' converts the 0-based index to a 1-based day number.
var result  =   weeks   .   reverse (   )   .   indexOf (   S   )   +   1   ;


// Display the computed result to the user via the console.
// This is the final output of the program.
console .   log (   result  )   ;