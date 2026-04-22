/*
 * This is a Type I clone generated to demonstrate
 * permissible modifications under the definition.
 * All identifiers and logic remain strictly identical.
 */
function     Main   (  s  )
{
    // The input string 's' is first split by newline characters.
    s   =   s.split (  "\n"  )   ;

    // The first element of the split array is parsed as an integer 'q'.
    const   q   =   +  s  [  0  ]   ;

    // A loop iterates 'q' times.
    for  (  var   i    =    0   ;    i    <    q   ;    i++  )
    {
        // Inside the loop, the (i+1)-th line is split by spaces and mapped to numbers.
        var   a   =   s  [  i    +    1  ]  .split (  " "  )  .map (  a   =>   +a  )   ;

        // Determine the maximum of the first two numbers in 'a'.
        var   b   =   Math.max (  a  [  0  ]  ,   a  [  1  ]  )   ;

        // Reassign 'a' to be the minimum of the first two numbers.
        a   =   Math.min (  a  [  0  ]  ,   a  [  1  ]  )   ;

        // Calculate 'c' using Math.ceil and Math.sqrt.
        var   c   =   Math.ceil (  Math.sqrt (  a    *    b  )  )   ;

        // Initialize 'ans' based on 'a'.
        var   ans   =   (  a    -    1  )    *    2   ;

        // Conditional increment for 'ans'.
        if  (  a    <    b    -    1  )
        {
            ans++   ;
        }

        /*
         * This inner loop performs further calculations
         * based on 'a', 'b', and 'c'.
         */
        for  (  var   j    =    a    +    1   ;    j    <    c   ;    j++  )
        {
            // Check a specific condition involving 'a', 'j', and 'b'.
            if  (  Math.floor (  a    /    j    *    b  )    ===    j  )
            {
                ans++   ;
            }
            else
            {
                ans    +=    2   ;
            }
        }

        // The final calculated answer for the current iteration is logged.
        console.log (  ans  )   ;

    } // End of the main loop.

} // End of the Main function definition.

/*
 * This line reads input from stdin and passes it to the Main function.
 * It's crucial for the script's execution environment.
 */
Main (  require (  "fs"  )  .readFileSync (  "/dev/stdin"  ,  "utf8"  )  )   ;