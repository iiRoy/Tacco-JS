/*
 * This is a Type I clone of a JavaScript program.
 * It processes input to perform some calculation.
 * All identifiers and logic are preserved exactly.
 */

// Define the main function that handles the input
function  Main (  input  )   {

   // Split the input string by newlines to get an array of lines
   var    input    =    input . split ( "\n" ) ;


   // Parse K from the first line, first element
   var    K    =    parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;

   // Parse T from the first line, second element
   var    T    =    parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;


   // Process the second line: split by spaces, then map to integers
   var    a    =    input [ 1 ] . split ( " " ) . map ( ( el , i ) => {

      // Convert each element to an integer
      return    parseInt ( el ) ;

   } ) ;


   // Sort the array 'a' in ascending order based on the provided comparator
   a . sort ( ( a , b ) => {

      return    a    <    b

   } ) ;


   // Calculate and print the maximum of two values:
   // 1. (2 * first_element_of_a - 1 - sum_of_all_elements_in_a)
   // 2. 0
   console . log ( Math . max . apply ( null , [ 2 * a [ 0 ]    -    1    -    a . reduce ( ( a , b ) =>    a    +    b ,    0 ) ,    0 ] ) ) ;

}

// Call the Main function with input read from /dev/stdin using Node.js filesystem module
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;