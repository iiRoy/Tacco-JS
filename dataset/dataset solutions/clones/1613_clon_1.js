var     input    =    require("fs")   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;   //  Reads the entire standard input file synchronously as a UTF-8 string.

var   cin   =   input   .   split   (   /   |   \n   /   )   ;   //  Splits the input string by spaces or newlines into an array of strings.

var       N       =       parseInt   (   cin   [   0   ]   )   ;   //  Parses the first element of the 'cin' array as an integer, storing it in N.

var     count     =     0     ;   //  Initializes a counter variable to zero. This will store the final result.

var     k     =     0     ;   //  Initializes a temporary counter variable, likely for tracking loop iterations.

//  Outer loop: iterates from j = 1 up to N (inclusive).
for       (       let       j       =       1       ;       j       <       N       +       1       ;       j       )       {

    //  Inner loop: iterates from i = 1 up to j-1 (exclusive).
    for       (       let       i       =       1       ;       i       <       j       ;       i++       )       {

        //  Previous debug statement for pair (i, j) - currently commented out.
        //  console.log   (   '(   '   ,   i   ,   '   ,   '   ,   j   ,   '   )'   )   ;

        //  Another commented out debug statement, likely for the 'k' variable.
        //  console.log   (   k   )   ;

        k++   ;   //  Increments the temporary counter 'k' for each inner loop iteration.

        //  A complex calculation that was likely attempted and then commented out, possibly for floating point precision.
        //  let   b   =   (   parseInt   (   cin   [   i   ]   *   1000000000   )   *   parseInt   (   cin   [   j   ]   *   1000000000   )   )   /   1000000000000000000   ;

        let   ai   =   cin   [   i   ]   .   toString   (   )   ;   //  Converts the i-th element of 'cin' to a string.
        let   aj   =   cin   [   j   ]   .   toString   (   )   ;   //  Converts the j-th element of 'cin' to a string.

        //  Checks if either of the numbers (as strings) contains a decimal point.
        if       (       (       ai   .   indexOf   (   '.'   )       ==       -1       )       &&       (       aj   .   indexOf   (   '.'   )       ==       -1       )       )       {
            //  Both numbers are integers (no decimal point found).
            //  console.log(cin[i], cin[j])  // Debugging line, now commented.
            //  console.log('OK')            // Debugging line, now commented.
            count       +=       1       ;   //  Increment the main counter if both are integers.
        }       else       if       (       (   ai   .   indexOf   (   '.'   )       >       -1       )       &&       (   aj   .   indexOf   (   '.'   )       ==       -1       )       )       {
            //  'ai' contains a decimal point, but 'aj' does not (aj is an integer).
            let   f   =   ai   .   length       -       ai   .   indexOf   (   '.'   )       -       1       ;   //  Calculates the number of decimal places in 'ai'.
            //  console.log(f)               // Debugging line, now commented.
            //  console.log(parseInt((parseInt(ai.split('.')[1]) * cin[j]).toString().substr(-f))) // Debugging line, now commented.

            //  Checks if the fractional part of (ai * aj) is zero.
            //  This is done by multiplying the fractional part of ai by aj,
            //  converting to string, and checking the last 'f' digits.
            if       (   parseInt   (   (   parseInt   (   ai   .   split   (   '.'   )   [   1   ]   )       *       cin   [   j   ]   )   .   toString   (   )   .   substr   (   -f   )   )       ==       0   )       {
                count       +=       1       ;   //  Increment the counter if the product results in an integer.
                //  console.log(cin[i], cin[j])  // Debugging line, now commented.
                //  console.log('OK')            // Debugging line, now commented.
            }       else       {
                //  Product is not an integer.
                //  console.log(cin[i], cin[j])  // Debugging line, now commented.
                //  console.log('NG')            // Debugging line, now commented.
            }
        }       else       if       (       (   aj   .   indexOf   (   '.'   )       >       -1       )       &&       (   ai   .   indexOf   (   '.'   )       ==       -1       )       )       {
            //  'aj' contains a decimal point, but 'ai' does not (ai is an integer).
            let   f   =   aj   .   length       -       aj   .   indexOf   (   '.'   )       -       1       ;   //  Calculates the number of decimal places in 'aj'.

            //  Similar check as above, but for aj * ai.
            if       (   parseInt   (   (   parseInt   (   aj   .   split   (   '.'   )   [   1   ]   )       *       cin   [   i   ]   )   .   toString   (   )   .   substr   (   -f   )   )       ==       0   )       {
                count       +=       1       ;   //  Increment the counter if the product results in an integer.
                //  console.log(cin[i], cin[j])  // Debugging line, now commented.
                //  console.log('OK')            // Debugging line, now commented.
            }       else       {
                //  Product is not an integer.
                //  console.log(cin[i], cin[j])  // Debugging line, now commented.
                //  console.log('NG')            // Debugging line, now commented.
            }
        }
    }
}

console   .   log   (   count   )   ;   //  Outputs the final accumulated count to the console.