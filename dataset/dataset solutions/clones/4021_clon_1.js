/* This file contains a JavaScript program designed to process numerical input.
   It demonstrates basic function definition, array manipulation,
   looping constructs, and conditional logic using the ternary operator. */


function   main  (   input   )   {

     // Declare and initialize the 'line' variable.
     // It takes the input string, splits it by newline characters,
     // and then converts each resulting string segment into a number.
     var     line     =     input .  split  (  '\n'  )  .  map  (  Number  )  ;


     // Loop to reduce the first element of the 'line' array.
     // If line[0] is greater than 500, subtract 500 from it.
     // This loop continues until line[0] is 500 or less.
     while  (  line  [  0  ]   >   500  )     line  [  0  ]   -=   500  ;


     /* Perform a conditional check using a ternary operator.
        Compare the modified first element (line[0]) with the second element (line[1]).
        If line[0] is less than or equal to line[1], print 'Yes' to the console.
        Otherwise, print 'No'. */
     line  [  0  ]   <=   line  [  1  ]   ?   console  .  log  (  'Yes'  )   :   console  .  log  (  'No'  )  ;

}  // End of the main function definition.


/* This section handles reading input from standard input and
   then calling the 'main' function with that input.
   It uses Node.js's 'fs' module to read the file at '/dev/stdin'
   and decodes it as 'utf8'. */
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;