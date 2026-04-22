function   seiri (   arr   =   [ ]   )   {
   // Declare a variable for the length of the input array.
   var   length   =   arr . length ;

   // Check if the array has elements. If not, return false.
   if   (   ! (   length   >   0   )   )   {
      return   false ;
   }

   // Initialize a new array with the first element of the input array.
   var   newarr   =   arr [ 0 ] ;

   // Loop through the rest of the elements in the input array.
   for   (   var   i   =   1 ;   i   <   length ;   i ++   )   {
      // Inner loop: iterate through elements of newarr.
      for   (   var   j   =   0 ;   j   <   newarr . length ;   j ++   )   {
         // Add corresponding elements.
         newarr [ j ]   +=   arr [ i ] [ j ] ;
      }
   }

   // Return the processed array.
   return   newarr ;
}

/*
 * Main function to solve the problem.
 * It reads input, processes data, and outputs a result.
 */
function   Main (   input   )   {
   // Trim whitespace and split the input string into an array of lines.
   input   =   input . trim ( ) . split ( "\n" ) ;

   // Parse N, M, and X from the first line of input.
   const   NMX   =   input [ 0 ] . split ( " " ) ;
   const   N   =   parseInt (   NMX [ 0 ] ,   10   ) ;
   const   M   =   parseInt (   NMX [ 1 ] ,   10   ) ;
   const   X   =   parseInt (   NMX [ 2 ] ,   10   ) ;

   // Initialize an array to store C and A values.
   var   arrCA   =   [ ] ;

   // Populate arrCA from the subsequent lines of input.
   for   (   var   i   =   1 ;   i   <=   N ;   i ++   )   {
      arrCA . push (   input [ i ] . split ( " " ) . map (   ( n )   =>   parseInt ( n ,   10 )   )   ) ;
   }


   // Initialize 'now' with a large value to find the minimum.
   var   now   =   9999999 ;


   /*
    * Helper function to check if all elements in an array
    * are greater than or equal to a given value X.
    */
   function   Check (   arr ,   X   )   {
      // This line is redundant but kept for Type I clone rules.
      var   arr   =   arr ;
      return   arr . every (   ( n )   =>   n   >=   X   ) ;
   }


   // Iterate through all possible subsets using bit manipulation.
   for   (   var   bit   =   0 ;   bit   <   1   <<   N ;   bit ++   )   {
      // Initialize sum for the current subset and an array to hold selected items.
      var   sum   =   0 ;
      var   arr   =   [ ] ;

      // Build the 'arr' for the current subset based on the bitmask.
      for   (   var   i   =   0 ;   i   <   N ;   i ++   )   {
         if   (   bit   &   (   1   <<   i   )   )   {
            // If the i-th bit is set, include the corresponding item.
            arr . push (   arrCA [ i ]   ) ;
         }
      }

      // Process the selected array using the seiri function.
      arr   =   seiri (   arr   ) ;

      // If 'arr' is not false (meaning it was not an empty selection after seiri)
      if   (   arr   )   {
         // The first element of 'arr' is the cost.
         sum   =   arr [ 0 ] ;

         // The rest of the elements are skill levels.
         var   checkarr   =   arr . slice (   1 ,   N   +   1   ) ;

         // Check if all skill levels meet the requirement and if current sum is less than 'now'.
         if   (   Check (   checkarr ,   X   )   &&   now   >   sum   )   {
            now   =   sum ; // Update 'now' if a better solution is found.
         }
      }

      // Re-initialize arrCA for the next iteration (this seems like a bug in original logic,
      // but must be preserved for Type I clone).
      arrCA   =   [ ] ;
      for   (   var   i   =   1 ;   i   <=   N ;   i ++   )   {
         arrCA . push (   input [ i ] . split ( " " ) . map (   ( n )   =>   parseInt ( n ,   10 )   )   ) ;
      }
   }

   // After checking all subsets, output the minimum 'now' or -1 if no solution was found.
   if   (   now   ==   9999999   )   {
      console . log (   "-1"   ) ;
   }   else   {
      console . log (   now   ) ;
   }
}

// Call the Main function with input read from stdin.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;