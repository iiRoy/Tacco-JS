// This is a Type I clone of an original JavaScript program.
// It processes input data to determine relationships between "members".
// The code's core logic and structure remain identical to the original.
// Whitespace and comments have been extensively modified to create visual differentiation.


function    Main (    input    )    {

    // Declare and initialize an object to store member relationships or values.
    // Each key represents a member, and its value represents its assigned numerical position/value.
    var     menbers     =   {   }   ;


    // Initialize a boolean variable 'res' to true.
    // This variable will hold the final result: true for 'Yes', false for 'No'.
    var     res     =   true    ;


    // Process the input string:
    // 1. Split the input by newline characters to get individual lines.
    // 2. Use .slice(1) to skip the first line, assuming it might be a header or irrelevant.
    var     arr     =   input.split (    /\n/    ) . slice (    1    )   ;


    // Declare an array 'rest'. This array will temporarily hold lines
    // that cannot be processed in the current iteration of the main loop.
    var     rest    =   [ ] ;


    // Begin the main processing loop.
    // This loop continues as long as there are lines remaining in the 'arr' array.
    while   (   arr.length     !==     0   )   {

        // Clear the 'rest' array at the beginning of each major iteration.
        // This ensures that 'rest' only contains lines deferred from the current 'arr' processing.
        rest    =   [ ] ;


        // Iterate over each 'line' in the current 'arr' array.
        // The 'index' of the line is also available, which is crucial for a specific condition.
        arr.forEach (   (   line,   index   )   =>  {

            // Parse the current line:
            // 1. Split the line by whitespace characters to get individual string components.
            // 2. Map each string component to its numerical representation.
            var     fn  =   line.split (    /\s/    ) . map (   str     =>  {

                // Convert the string to a number.
                return  Number (    str    )    ;
            }   )   ;


            // Condition 1: Check if both members (fn[0] and fn[1]) are already defined in 'menbers'.
            if  (   menbers [   fn [   0   ]   ]   !==     undefined   &&
                    menbers [   fn [   1   ]   ]   !==     undefined   )   {

                // If both are defined, verify if their relationship matches the given difference (fn[2]).
                // The relationship is: menbers[fn[1]] - menbers[fn[0]] should equal fn[2].
                // If it doesn't match, set 'res' to false, indicating an inconsistency.
                res     =   (   menbers [   fn [   1   ]   ]   -   menbers [   fn [   0   ]   ]   )   ===     fn [   2   ]   ;

            }   else    if  (   menbers [   fn [   0   ]   ]   !==     undefined   )   {
                // Condition 2: Only the first member (fn[0]) is defined in 'menbers'.

                // Calculate the value for the second member (fn[1]) based on the first member
                // and the given difference (fn[2]).
                menbers [   fn [   1   ]   ]    =   menbers [   fn [   0   ]   ]   +   fn [   2   ]   ;

            }   else    if  (   menbers [   fn [   1   ]   ]   !==     undefined   )   {
                // Condition 3: Only the second member (fn[1]) is defined in 'menbers'.

                // Calculate the value for the first member (fn[0]) based on the second member
                // and the given difference (fn[2]).
                menbers [   fn [   0   ]   ]    =   menbers [   fn [   1   ]   ]   -   fn [   2   ]   ;

            }   else    if  (   index   ===     0   )   {
                // Condition 4: Neither member is defined, AND this is the first line
                // being processed in the current 'arr' iteration.

                // Initialize a 'start' variable to find an available key for new members.
                let     start   =   0   ;

                // Loop to find the smallest non-negative integer that is not yet a key in 'menbers'.
                while   (   menbers [   start   ]   !==     undefined   )   {
                    start   ++  ;
                }

                // Assign the found 'start' value to the first member (fn[0]).
                menbers [   fn [   0   ]   ]    =   start   ;

                // Calculate and assign the value for the second member (fn[1]) based on the first.
                menbers [   fn [   1   ]   ]    =   menbers [   fn [   0   ]   ]   +   fn [   2   ]   ;

            }   else    {
                // Condition 5: Neither member is defined, AND it's NOT the first line
                // in the current 'arr' iteration.

                // This line cannot be processed yet, so push it to the 'rest' array
                // to be attempted in a subsequent iteration.
                rest.push (    line    )    ;

            }

        }   )   ;   // End of the forEach loop for current 'arr'.


        // After attempting to process all lines in 'arr', update 'arr' with the 'rest' array.
        // This effectively retries the deferred lines in the next main loop iteration.
        arr     =   rest    ;

    }   // End of the while loop.


    // Output the final result to the console.
    // If 'res' is true, print 'Yes'; otherwise, print 'No'.
    console.log (   res     ?   'Yes'   :   'No'    )   ;

}   // End of the Main function definition.


// Immediately invoke the Main function.
// It reads input from standard input ('/dev/stdin') using Node.js 'fs' module,
// and decodes it as 'utf8' text.
Main (    require (   'fs'    ) . readFileSync (    '/dev/stdin',    'utf8'    )   )   ;