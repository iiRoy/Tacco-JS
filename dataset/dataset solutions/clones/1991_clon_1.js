/*
  * This code is a Type I clone.
  * It's designed to be functionally identical
  * to the original source, with only
  * superficial changes in formatting
  * and comments.
  *
  * No logical or structural modifications have been made.
  */
function   main   (   N  ,  S   )
{


  const   S_array   =   S . split ( '' ) ;  // Convert input string 'S' into an array of characters.


  let   r   =   0  ,
      g   =   0  ,
      b   =   0  ;  // Initialize counters for 'R', 'G', 'B' characters found in 'S'.


  for   (   s   of   S_array   )
  {
      // Check character and increment the corresponding counter.
      if   (   s   ===   'R'   )   {   ++r   ;   }
      if   (   s   ===   'G'   )   {   ++g   ;   }
      if   (   s   ===   'B'   )   {   ++b   ;   }
  }


  const   total   =   r   *   g   *   b   ;  // Calculate the total possible combinations of R, G, B.


  let   res   =   0   ;  // This variable will count the number of invalid triplets.


  // Nested loops to iterate through all possible pairs (i, j) where i < j.
  for   (   let   i   =   0   ;   i   <   N   ;   i ++   )
  {
      for   (   let   j   =   i   +   1   ;   j   <   N   ;   j ++   )
      {

          // If characters at positions 'i' and 'j' are identical, this pair cannot form a valid triplet.
          if   (   S_array[i]   ===   S_array[j]   )
          {
              continue   ;  // Move to the next pair (j).
          }


          let   k   =   2   *   j   -   i   ;  // Calculate the index for the third character 'k'.

          /*
           * Two conditions make a triplet invalid:
           * 1. The calculated index 'k' is out of bounds (greater than or equal to N).
           * 2. The character at 'k' is identical to either the character at 'i' or 'j'.
           */
          if   (   k   >=   N   ||   S_array[k]   ===   S_array[i]   ||   S_array[k]   ===   S_array[j]   )
          {
              continue   ;  // Skip this triplet as it's invalid.
          }


          ++res   ;  // If all conditions pass, this triplet is valid; increment the counter.
      }
  }

  // The final result is the total possible triplets minus the invalid ones found.
  console . log (   total   -   res   )   ;

}


// Standard input reading setup for competitive programming environments.
const   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( '\n' ) ;


// Invoke the main function with the first two lines of input.
main (   input[0]  ,  input[1]   ) ;