/*
 * This JavaScript code defines a function to calculate the product of a list of BigInt numbers.
 * It handles potential overflow and a special case for zero.
 */
const        main       =    arg    =>    {
    // The input 'arg' is a string, which needs to be processed.
    // First, trim any leading/trailing whitespace, then split by newline characters.
    const      input      =    arg.trim()  .split("\n")    ;

    // The first line of input is expected to contain 'n', which is parsed as an integer.
    // In this specific problem context, 'n' might not be directly used in the calculation,
    // but it's part of the input structure.
    const      n      =    parseInt(input[0])    ;

    // The second line of input contains space-separated numbers.
    // These are split into an array of strings, and then each string is mapped to a BigInt.
    const      arr      =    input[1].split(" ")  .map(    item    =>    BigInt(item)    )    ;

    // --- Core Logic for Product Calculation ---

    // Check if the array contains the BigInt 0.
    // If it does, the product of all numbers will be 0, regardless of other values.
    if  (  arr.includes(0n)  )  {
        console.log(0)    ; // Output 0 to standard output.
        return    ; // Exit the function early as the result is determined.
    }

    // Initialize the result variable 'ret' with BigInt 1.
    // This is the multiplicative identity.
    let      ret      =    1n    ;

    // Iterate through each 'item' (BigInt number) in the 'arr' array.
    for  (  let    item    of    arr  )  {
        ret      =    ret  *  item    ; // Multiply the current product 'ret' by the 'item'.

        // Check for product overflow.
        // If the product 'ret' exceeds a very large BigInt value (10^18 in this case),
        // it indicates an overflow condition as per problem constraints.
        if  (  ret    >    BigInt(1000000000000000000)  )  {
            console.log(-1)    ; // Output -1 to indicate an overflow.
            return    ; // Exit the function early.
        }
    }

    // If the loop completes without finding a 0n or an overflow,
    // print the final calculated product, converted to a string.
    console.log(ret.toString())    ;
}

// --- Input Reading and Function Execution ---

// The main function is called with input read from '/dev/stdin'.
// The 'fs' module is used to read the file synchronously, and 'utf8' encoding is specified.
main(  require('fs')  .readFileSync('/dev/stdin',    'utf8')  )    ;