/*
 * This is the main function that processes the input.
 * It calculates the count of unique prime factor combinations.
 */
function   main (   input   )
{
   let   N   =   parseInt(   input   )   ; //  Parse the input string into an integer.
   const   used   =   [   ]   ;          //  An array to store numbers that have already been processed.
   let   count   =   0   ;             //  A counter for the final result.

   //  Handle the edge case where N is 1.
   if   (   N   ===   1   )
   {
      return   console.log(   0   )   ;
   }


   //  Obtain the prime factors of N using a helper function.
   const   prime_numbers   =   primeNumbers(   N   )   ;
   let   pre   =   0   ; //  Stores the previous prime factor encountered.
   let   current   =   0   ; //  Stores the current number being checked for uniqueness.

   //  Iterate through each prime factor.
   prime_numbers.forEach(   i   =>
   {
      //  If the current prime factor 'i' is different from the previous one 'pre',
      //  reset 'current' to 'i'.
      if   (   pre   !==   i   )
      {
         current   =   i   ; /*  Reset current value  */
      }

      //  Check if 'current' is already in the 'used' array.
      if   (   !   used.includes(   current   )   )
      {
         used.push(   current   )   ; //  If not used, add it to the 'used' array.
         count++   ;                  //  Increment the unique count.
      }
      else
      {
         //  If 'current' is already used, multiply it by the current prime factor 'i'.
         //  This forms a new combination.
         current   *=   i   ;
      }

      //  Update 'pre' for the next iteration.
      pre   =   i   ;
   }   )   ;


   //  Output the final calculated count.
   console.log(   count   )   ;
}


/*
 *  This helper function calculates the prime factors of a given number n.
 */
function     primeNumbers     (     n     )
{
     var     result     =     [ ]     ; //  Array to hold the prime factors.

     //  Special handling for n = 1.
     if     (     n     ===     1     )
     {
          return     [ 1 ]     ;
     }

     var     init     =     2     ; //  Start checking for factors from 2.

     //  Continue factoring until n becomes 1.
     while     (     n     !==     1     )
     {
          var     i     =     init     ; //  Current divisor candidate.
          //  Inner loop to find the smallest prime factor of the current n.
          while     (     i     <     Number.MAX_SAFE_INTEGER     )
          {
               if     (     n     %     i     ==     0     )
               {
                    result.push(     i     )     ; //  Add the factor to the result.
                    n     /=     i     ;          //  Reduce n by dividing it by the factor.
                    break     ;                   //  Break to find factors for the new n.
               }
               i++     ; //  Try the next number as a potential factor.
          }
          init     =     i     ; //  Optimize: next search starts from the current factor 'i'.
     }
     return     result     ; //  Return the list of prime factors.
}


//  Entry point for the script: read input and execute the main logic.
main(   require(   'fs'   ) . readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;