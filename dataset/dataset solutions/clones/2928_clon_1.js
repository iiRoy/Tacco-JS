/*
 * This is a Type I clone example.
 * The original function processes input to calculate a result based on conditions.
 * Only whitespace and comments have been altered.
 */
function     Main(    input   ) {

    // The input string is split by spaces to get individual values.
    input   =   input.split(" ");


    // Parse the first part of the input as an integer for variable 'a'.
    var a   =   parseInt(   input[0]   ,   10   )   ;

    // Parse the second part of the input as an integer for variable 'b'.
    var b   =   parseInt(   input[1]   ,   10   )   ;

    // Declare a variable 'res' to store the calculated result.
    var res   ;


    /*
     * First condition: If 'a' is 13 or greater.
     * In this case, 'res' is assigned the value of 'b'.
     */
    if  (   a   >=   13   )   {
        res   =   b   ;
    }

    /*
     * Second condition: If 'a' is 6 or less AND 'a' is 13 or less.
     * Note: The 'a <= 13' part is redundant given 'a <= 6', but it's kept as per Type I definition.
     * If this condition is met, 'res' is assigned half the value of 'b'.
     */
    if  (   a   <=   6   &&   a   <=   13   )   {
        res   =   b   /   2   ;
    }

    /*
     * Third condition: If 'a' is 5 or less.
     * If this condition is met, 'res' is assigned the value 0.
     */
    if  (   a   <=   5   )   {
        res   =   0   ;
    }

    // Output the final calculated result to the console.
    console.log(   res   )   ;
}

// --- Program execution starts here ---

// Read input from standard input (/dev/stdin) using Node.js 'fs' module,
// then call the Main function with the read content.
Main(   require("fs").readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;

/*
 * End of the cloned JavaScript code.
 */