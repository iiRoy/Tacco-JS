var   obj   =   init ( )   ;   /* Initialize the global input object */

 Main ( ) ;   // Begin execution of the primary program logic.

 /*
  * Function to retrieve the next integer from the input stream.
  * It utilizes the 'myconv' utility for type conversion.
  */
 function   nextInt ( )   {
     return   myconv (   next ( ) ,   1   )   ;
 }


 function   nextStrArray ( )   {
     // Fetches the next input line and splits it by half-width spaces.
     return   myconv (   next ( ) ,   2   )   ;
 }

 /*
  * Retrieves the next line of input, splits it by spaces,
  * and converts each resulting substring into a number.
  */
 function   nextIntArray ( )   {
     return   myconv (   next ( ) ,   4   )   ;
 }


 function   nextCharArray ( )   {
     return   myconv (   next ( ) ,   6   )   ;   // Splits the next input token into an array of characters.
 }


 function   next ( )   {
     return   obj . next ( )   ;   // Delegates to the input object's 'next' method.
 }


 function   hasNext ( )   {
     // Checks if there are more input tokens available for processing.
     return   obj . hasNext ( )   ;
 }

 /*
  * Reads the entire content of standard input,
  * trims leading/trailing whitespace, and splits it into an array of lines.
  */
 function   myin ( )   {
     return   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( ) . split ( "\n" )   ;
 }


 /*
  * Initializes the input handling mechanism.
  * It creates an object that manages reading lines from the input source.
  */
 function   init ( )   {
     var   inputFile   =   myin ( )   ;

     var   returnObj   =   {
         "list"   :   inputFile ,   // Stores all input lines.
         "index"   :   0 ,           // Current position in the input list.
         "max"   :   inputFile . length ,   // Total number of input lines.

         // Method to check if there are more lines to read.
         "hasNext"   :   function ( )   {
             return   (   this . index   <   this . max   )   ;
         } ,

         // Method to get the next line from the input.
         "next"   :   function ( )   {
             if   (   !   this . hasNext ( )   )   {
                 throw   "ArrayIndexOutOfBoundsException これ以上ないよ" ;   // Error if no more input.
             }   else   {
                 var   returnInput   =   this . list [   this . index   ]   ;
                 this . index ++   ;   // Advance the index.
                 return   returnInput   ;
             }
         }
     } ;

     return   returnObj   ;
 }


 function   myout (   t   )   {
     console . log (   t   )   ;   // Outputs the given value to the standard output stream.
 }


 function   myerr (   t   )   {
     console . error (   t   )   ;   // Logs the given value as an error to the standard error stream.
 }


 /*
  * myconv: A versatile conversion utility function.
  * It takes an input 'i' and a conversion type 'no'.
  *
  * Parameter 'no' defines the conversion logic:
  *   1: Converts 'i' to an integer.
  *   2: Splits 'i' by half-width spaces into an array of strings.
  *   4: Splits 'i' by half-width spaces and maps each part to a number, returning an array of numbers.
  *   6: Splits 'i' into an array of individual characters.
  *   7: Splits 'i' into characters and maps each to a number, returning an array of numbers.
  *   8: Joins elements of array 'i' with half-width spaces.
  *   9: Joins elements of array 'i' with newline characters.
  *   0: Joins elements of array 'i' without any separator.
  *   Default: Returns 'i' unchanged if 'no' is not recognized or an error occurs.
  */
 function   myconv (   i ,   no   )   {
     try   {
         switch   (   no   )   {
             case   1   :
                 return   parseInt (   i   )   ;
             case   2   :
                 return   i . split (   " "   )   ;
             case   4   :
                 return   i . split (   " "   ) . map (   (   a   )   =>   Number (   a   )   )   ;
             case   6   :
                 return   i . split (   ""   )   ;
             case   7   :
                 return   i . split (   ""   ) . map (   (   a   )   =>   Number (   a   )   )   ;
             case   8   :
                 return   i . join (   " "   )   ;
             case   9   :
                 return   i . join (   "\n"   )   ;
             case   0   :
                 return   i . join (   ""   )   ;
             default   :
                 return   i   ;
         }
     }   catch   (   e   )   {
         return   i   ;   // Returns original input if conversion fails.
     }
 }

 /*
  * The Main function encapsulates the core logic of the program.
  * It reads spell data, performs a dynamic programming calculation
  * to find the minimum magic cost to achieve a certain HP, and outputs the result.
  */
 function   Main ( )   {
     var   one   =   nextIntArray ( )   ;   // Reads the first line containing H and N.
     var   H   =   one [   0   ]   ;           // Target HP to reach.
     var   N   =   one [   1   ]   ;           // Number of available spells.

     var   list   =   new   Array (   N   )   ;   // Array to store spell objects.

     // Populates the 'list' array with spell damage and maryoku costs.
     for   (   var   i   =   0   ;   i   <   N   ;   i ++   )   {
         var   tmp   =   nextIntArray ( )   ;   // Reads damage and maryoku for the current spell.
         list [   i   ]   =   {
             "damage"   :   tmp [   0   ] ,    // Damage inflicted by the spell.
             "maryoku"   :   tmp [   1   ]    // Maryoku (magic power) cost of the spell.
         } ;
     }

     var   maxHP   =   100000   ;   // A large enough value to cover all possible HP sums.
     var   dp   =   new   Array (   maxHP   )   ;   // Dynamic programming array; dp[i] stores min maryoku for 'i' damage.

     dp [   0   ]   =   0   ;   // Base case: 0 damage requires 0 maryoku.

     // Iterates through each spell.
     for   (   var   i   =   0   ;   i   <   N   ;   i ++   )   {
         // Iterates through possible current HP values, from 0 up to H-1.
         for   (   var   j   =   0   ;   j   <   H   ;   j ++   )   {
             // If a valid maryoku cost to reach 'j' damage is known.
             if   (   dp [   j   ]   !=   null   )   {
                 var   currentSpellDamage   =   list [   i   ] [   "damage"   ]   ;
                 var   currentSpellMaryoku   =   list [   i   ] [   "maryoku"   ]   ;
                 var   newTotalDamage   =   j   +   currentSpellDamage   ;
                 var   newTotalMaryoku   =   dp [   j   ]   +   currentSpellMaryoku   ;

                 // If this new damage value has not been reached or if the current path is cheaper.
                 if   (   !   dp [   newTotalDamage   ]   )   {
                     dp [   newTotalDamage   ]   =   newTotalMaryoku   ;
                 }   else   {
                     dp [   newTotalDamage   ]   =   Math . min (   dp [   newTotalDamage   ] ,   newTotalMaryoku   )   ;
                 }
             }
         }
     }

     var   last   =   1000000007   ;   // A large number used as an initial "infinity" value.

     // Ensure dp[maxHP] has a value for subsequent calculations, if not set.
     if   (   !   dp [   maxHP   ]   )   {
         dp [   maxHP   ]   =   last   ;
     }

     // myerr(dp); // Debugging line, commented out as per typical competitive programming practices.

     /*
      * Post-processing the DP array:
      * For each HP value 'i', dp[i] should store the minimum maryoku cost
      * to achieve AT LEAST 'i' HP. This implies that dp[i] must be
      * less than or equal to dp[i+1].
      */
     for   (   var   i   =   maxHP   -   1   ;   i   >=   0   ;   i --   )   {
         if   (   dp [   i   ]   )   {
             // If dp[i] has a defined cost, compare it with dp[i+1] and take the minimum.
             dp [   i   ]   =   Math . min (   dp [   i   ] ,   dp [   i   +   1   ]   )   ;
         }   else   {
             // If dp[i] is undefined (meaning 'i' HP cannot be reached exactly),
             // inherit the cost from dp[i+1] (cost to reach at least 'i+1' HP).
             dp [   i   ]   =   dp [   i   +   1   ]   ;
         }
     }

     // Output the final minimum maryoku cost required to achieve at least H HP.
     myout (   dp [   H   ]   )   ;
 }