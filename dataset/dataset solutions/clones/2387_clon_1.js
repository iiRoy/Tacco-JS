/* This function processes the entire input data provided.
 * It expects a string representing a day of the week.
 */
function   Main   (   input   )
{
    // Define an array of objects, where each object represents a day of the week.
    // Each day has a 'name' (string) and a 'period' (numeric identifier).
    const   days   =   [
        {   name : "SUN"   ,   period : 0   }  ,   // Sunday, period 0
        {   name : "MON"   ,   period : 1   }  ,   // Monday, period 1
        {   name : "TUE"   ,   period : 2   }  ,   // Tuesday, period 2
        {   name : "WED"   ,   period : 3   }  ,   // Wednesday, period 3
        {   name : "THU"   ,   period : 4   }  ,   // Thursday, period 4
        {   name : "FRI"   ,   period : 5   }  ,   // Friday, period 5
        {   name : "SAT"   ,   period : 6   }    // Saturday, period 6
    ] ;

    // Calculate the 'period' value based on the input day.
    // It finds the matching day, gets its period, subtracts 7, and takes the absolute value.
    const   period   =   Math . abs (   days . find (   ( x )   =>   x . name   ===   input   ) . period   -   7   )   ;

    // Output the calculated period to the console.
    console . log (   period   )   ;
}


// --- DO NOT MODIFY THE FOLLOWING LINES ---
// This section handles standard input/output and function invocation.
// It reads the entire input from stdin and calls the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;