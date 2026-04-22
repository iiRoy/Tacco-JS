/* This is the main processing function. */
function Main(  input  ) { // Function definition starts here.

    // First, split the input string by spaces to get an array of string numbers.
    input = input.split(  " "  )  ;

    /*
     * Next, process the array:
     * 1. Convert each string element to an integer using the double-bitwise NOT operator (~~).
     * 2. Sort the array in ascending order.
     * 3. Reverse the sorted array to get descending order.
     */
    input  =  input  .  map(  a  =>  ~~a  )  .  sort(  )  .  reverse(  )  ;


    // Finally, calculate the result based on the sorted numbers.
    // The largest number (input[0]) is multiplied by 10, then the next two are added.
    return  input[0]  *  10  +  input[1]  +  input[2]  ;
} // End of Main function.


// This section handles the execution environment.
// It detects if the code is running in a Node.js environment or a browser.

(  (  b  ,  c  ,  d  )  =>  // This is a self-executing arrow function (IIFE).
    "undefined"  !=  typeof  require  ?  // Check if 'require' is defined (Node.js environment).
        console  .  log(  Main(  require(  "fs"  )  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  )  :  // Node.js path: read from stdin, call Main, log result.
        [  // Browser path:
            b  =  b  .  split(  "\n"  )  .  slice(  1  ,  -1  )  .  join(  "\n"  )  ,  // Process multi-line input string.
            c  =  function(  )  {  // Define an anonymous function to run Main and catch errors.
                try  {
                    return  Main(  b  )  ;  // Execute Main with the processed input.
                }  catch(  f  )  {
                    return  f  .  stack  ||  f  .  message  ;  // Return error stack or message on failure.
                }
            }(  )  ,  // Immediately invoke the function.
            d  =  typeof  c  ,  // Get the type of the result 'c'.
            "string"  ==  d  ||  (  c  =  JSON  .  stringify(  c  )  )  ,  // If 'c' is not a string, convert it to JSON string.
            $(  "<form>"  )  .  append(  // Create a form element and append content.
                [  // Array of elements to append.
                    [  10  ,  b  ]  ,  // Input textarea for 'b'.
                    0  ,  // Spacer.
                    [  1  ,  d  ]  ,  // Input textarea for 'd'.
                    0  ,  // Spacer.
                    [  10  ,  c  ]  // Input textarea for 'c'.
                ]  .  map(  f  =>  // Map over the array to create HTML elements.
                    $(  f  ?  "<textarea>"  :  "<br>"  ,  // If 'f' is truthy, create textarea; otherwise, create break.
                        f  &&  {  // If 'f' is truthy, set attributes for textarea.
                            rows  :  f[0]  ,
                            cols  :  40  ,
                            text  :  f[1]
                        }
                    )
                )
            )  .  appendTo(  "body"  )  // Append the form to the body.
        ]
)  // End of the IIFE definition.
(  // Parameters for the IIFE.
`
5 2 1
`  // The input string for the browser environment.
)