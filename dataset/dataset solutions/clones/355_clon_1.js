/*
 * This JavaScript code processes a grid of characters to find the largest
 * rectangle of '.' characters. It simulates reading input from stdin
 * and then processes it using a monotonic stack approach.
 *
 * This is a Type I clone, preserving all original identifiers, operators,
 * and expressions, while extensively varying whitespace and adding comments.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


// Initialize input variable, reading from stdin or using a mock string for testing.
var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;



// Mock input for local testing purposes. This line is part of the original code.
input    =    '2 4\n...*\n.*..\n0 0' ;



// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var    arr    =    input . trim ( ) . split ( "\n" ) ;



// Main loop to process multiple test cases. Each test case ends with "0 0".
while    ( true )    {

   // Shift the first line from the array, split by space, and convert parts to numbers.
   // This line contains the height (h) and width (w) for the current grid.
   var    hw    =    arr . shift ( ) . split ( " " ) . map ( Number ) ;


   // Check if the current line is the termination signal "0 0".
   if    ( hw . join ( " " )    ==    "0 0" )    {
      break ; // If it's "0 0", exit the main processing loop.
   }


   // Extract height and width from the 'hw' array.
   var    h    =    hw [ 0 ] ;
   var    w    =    hw [ 1 ] ;


   // Initialize a 2D array, 'yx', which will store the heights of consecutive '.' characters
   // for each cell, effectively transforming the grid into a histogram for each row.
   var    yx    =    [ ] ;


   // Loop through each row of the input grid.
   for    ( var    y    =    0 ;    y    <    h ;    y ++ )    {

      // Get the current row of characters from the input array.
      var    ary    =    arr . shift ( ) . split ( "" ) ;

      // Initialize the current row in the 'yx' array.
      yx [ y ]    =    [ ] ;


      // Iterate over each character (v) and its index (x) in the current row.
      ary . forEach ( function ( v ,    x )    {

         // If it's the first row (y == 0):
         if    ( y    ==    0    &&    v    ==    "." )    {
            yx [ y ] [ x ]    =    1 ; // A '.' has a height of 1.
         }
         else    if    ( y    ==    0    &&    v    !=    "." )    {
            yx [ y ] [ x ]    =    0 ; // A non-'.' character has a height of 0.
         }
         // If it's not the first row (y != 0):
         else    if    ( y    !=    0    &&    v    ==    "." )    {
            // For a '.', its height is 1 plus the height of the cell directly above it.
            yx [ y ] [ x ]    =    yx [ y - 1 ] [ x ]    +    1 ;
         }
         else    if    ( y    !=    0    &&    v    !=    "." )    {
            yx [ y ] [ x ]    =    0 ; // A non-'.' character resets the height to 0.
         }

      } ) ; // End of ary.forEach for processing characters in a row.

   } // End of for (y) loop for processing all rows.


   // Initialize 'max' to store the maximum rectangle area found so far across all rows.
   var    max    =    0 ;


   // Loop through each row (k) of the 'yx' array. Each row is treated as a histogram.
   for    ( var    k    =    0 ;    k    <    h ;    k ++ )    {

      // Initialize an empty stack 's'. This stack will store [height, index] pairs
      // to help find the largest rectangle in the current histogram row.
      var    s    =    [ ] ;

      // Add a sentinel value (0) at the end of the current row's heights. This ensures
      // that all elements in the stack are processed and popped at the end of the row.
      yx [ k ] [ w ]    =    0 ;


      // Iterate through each column (x) in the current histogram row, including the sentinel.
      for    ( var    x    =    0 ;    x    <=    w ;    x ++ )    {

         // Get the current height value.
         var    v    =    yx [ k ] [ x ] ;

         // The 'last' variable is used without explicit declaration in the original code.
         // This behavior is preserved for Type I cloning. It will be implicitly
         // declared as a global in non-strict mode, or throw an error in strict mode
         // if used before assignment in its scope.


         // If the stack is empty, push the current height and its index.
         if    ( s . length    ==    0 )    {
            s . push ( [ v ,    x ] ) ;
            continue ; // Move to the next column.
         }


         // If the current height 'v' is greater than the height at the top of the stack,
         // push 'v' and its index onto the stack.
         if    ( s [ s . length    -    1 ] [ 0 ]    <    v )    {
            s . push ( [ v ,    x ] ) ;
         }
         // If the current height 'v' is equal to the height at the top of the stack,
         // there's no need to push it again; continue to the next column.
         else    if    ( s [ s . length    -    1 ] [ 0 ]    ==    v )    {
            continue ;
         }
         // If the current height 'v' is less than the height at the top of the stack,
         // it means we've found a potential right boundary for rectangles formed by
         // elements currently in the stack. Process the stack.
         else    if    ( s [ s . length    -    1 ] [ 0 ]    >    v )    {

            // Pop elements from the stack until a height less than or equal to 'v' is found.
            while    ( true )    {

               // If the stack becomes empty, push 'v' with the 'last' index and break.
               // Note: 'last' might be undefined here if no element was popped yet in this loop.
               if    ( s . length    ==    0 )    {
                  s . push ( [ v ,    last ] ) ;
                  break ;
               }

               // Pop the top element 'r' from the stack. 'r' is [height, index].
               var    r    =    s . pop ( ) ;

               // If 'v' is greater than the popped height 'r[0]', push 'v' with the 'last' index
               // (which is the index of the previously popped element) and break.
               if    ( v    >    r [ 0 ] )    {
                  s . push ( [ v ,    last ] ) ;
                  break ;
               }

               // Update 'last' with the index of the popped element. This 'last' index
               // represents the left boundary of the rectangle being considered.
               last    =    r [ 1 ] ;

               // If 'v' is equal to the popped height 'r[0]', break (no need to push 'v' as it's already covered).
               if    ( v    ==    r [ 0 ] )    {
                  break ;
               }
               // If 'v' is less than or equal to the popped height 'r[0]', calculate the area
               // formed by the popped element 'r'.
               else    if    ( v    <=    r [ 0 ] )    {
                  // The area is height * width. Width is 'x' (current index) minus 'r[1]' (popped index).
                  max    =    Math . max ( max ,    r [ 0 ]    *    ( x    -    r [ 1 ] ) ) ;
               }

            } // End of while (true) for stack processing.

         } // End of else if for processing stack when current height is smaller.

      } // End of for (x) loop for iterating through columns.

   } // End of for (k) loop for processing all histogram rows.


   // After processing all rows and finding the maximum area, print it to the console.
   console . log ( max ) ;

} // End of while (true) main loop for test cases.