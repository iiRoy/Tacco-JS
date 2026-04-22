/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered extensively.
 */
function   Main   (   input   )   {
        // Initialize the input data by splitting it into lines.
        input    =    input .   split   (   "\n"   )    ;

    // Loop through each character of the first line of the input.
	for  (  var   i  =  0  ;   i  <  input  [  0  ]  .  lengh  ;   i++  )  {
        /*
         * Extract a single character at the current index 'i'.
         * This character will be checked against specific rules.
         */
           var   moji    =    input  [  0  ]  .  substr  (  i  ,   1  )  ;

           // Check if the current index 'i' is an even number.
           if   (   i   %   2   ==   0   )   {
                   // If 'i' is even, we expect the character NOT to be 'R'.
                   if   (   moji    ==    "R"   )   {
                        console .   log   (   "No"   )   ;   // Output "No"
                        return   ;                      // Terminate execution
                   }
           }   else   {
                   // If 'i' is odd, we expect the character NOT to be 'L'.
                   if   (   moji    ==    "L'   )   {
                        console .   log   (   "No"   )   ;   // Output "No"
                        return    ;                      // Terminate execution
                   }
           }
        }
	// If the loop completes without returning, it means all conditions were met.
       console .   log   (   "Yes"   )   ;   // Output "Yes"
       return   ;                         // Terminate execution successfully
}

/*
 * The following line should not be edited.
 * It handles standard input/output operations.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;