function   Main   (   input   )    {
    /*  Enforce strict mode for cleaner code  */
    "use strict"   ;

    //  The input string is assigned to 's'
    const   s  =  input  ;

    //  Splits the input string by "LR" and wraps each part with "R" and "L"
    //  This effectively creates segments that start with 'R' and end with 'L'
    const   division   =   s . split (   "LR"   ) . map (   e   =>   {
        return   "R"   +   e   +   "L"   ;   //  Adds boundary markers to each segment
    }   )   ;

    //  Get the total number of segments created
    const   len   =   division . length   ;

    //  Adjust the first segment: remove its artificial leading 'R'
    division   [   0   ]   =   division   [   0   ] . slice   (   1   )   ;

    //  Adjust the last segment: remove its artificial trailing 'L'
    division   [   len   -   1   ]   =   division   [   len   -   1   ] . slice   (   0   ,   -1   )   ;

    //  Initializes an empty array to store the final answer
    const   ans   =   [   ]   ;

    //  Iterates over each processed segment
    division . forEach (   e   =>   {
        /*  Process each segment of the divided string  */

        //  Get the length of the current segment
        const   len   =   e . length   ;

        //  Loop through each character position in the current segment
        for   (   let   i   =   0   ;   i   <   len   ;   i   ++   )   {
            //  Checks for the specific "RL" boundary condition within the segment
            //  This condition signifies a transition point where R's become L's
            if   (   i   !==   0   &&   e   [   i   -   1   ]   ===   "R"   &&   e   [   i   ]   ===   "L"   )   {
                //  If an "RL" boundary is found, the previously added '0' for the 'R' is popped
                ans . pop   (   )   ;

                //  Calculate the number of 'R's to the left of the boundary
                const   rNum   =   i   ;
                //  Calculate the number of 'L's from the boundary to the end of the segment
                const   lNum   =   len   -   i   ;

                //  Determine parity adjustments based on the counts
                //  'a' is 0 if rNum > lNum, 1 otherwise
                const   a   =   (   rNum   >   lNum   )   ?   0   :   1   ;
                //  'b' is 0 if the minimum of rNum and lNum is even, 1 otherwise
                const   b   =   (   Math . min   (   rNum   ,   lNum   )   %   2   ==   0   )   ?   0   :   1   ;

                //  'c' is the XOR result of 'a' and 'b'
                const   c   =   a   ^   b   ; //  This helps determine the distribution for odd lengths

                //  Handles cases based on the segment length parity
                if   (   len   %   2   ===   0   )   {
                    //  If the segment length is even, distribute equally
                    ans . push   (   len   /   2   )   ;
                    ans . push   (   len   /   2   )   ;
                }   else   if   (   c   ===   0   )   {
                    //  If odd length and 'c' is 0, distribute (len+1)/2 to R, (len-1)/2 to L
                    ans . push   (   (   len   +   1   )   /   2   )   ;
                    ans . push   (   (   len   -   1   )   /   2   )   ;
                }   else   {
                    //  If odd length and 'c' is 1, distribute (len-1)/2 to R, (len+1)/2 to L
                    ans . push   (   (   len   -   1   )   /   2   )   ;
                    ans . push   (   (   len   +   1   )   /   2   )   ;
                }
            }   else   {
                //  If no "RL" boundary is found at the current position, add a 0
                ans . push   (   0   )   ;
            }
        }
    }   )   ;

    //  Prints the final answer array elements joined by spaces
    console . log (   ans . join (   " "   )   )   ;
}

//  ---  DO NOT MODIFY THE FOLLOWING LINES ---
//  This part handles standard input/output and calls the Main function.
//  It reads the entire content of /dev/stdin as a UTF-8 string.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;