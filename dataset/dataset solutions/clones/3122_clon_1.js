// This JavaScript code processes input from standard input to perform a calculation.
// It involves parsing string input, character code manipulation, frequency counting,
// and modular arithmetic using a custom multiplication function.

console.log(
    (
        /*
         * This is an immediately invoked function expression (IIFE)
         * that takes the raw input string as its argument 'args'.
         * The entire script's logic is encapsulated within this anonymous function.
         */
        args    =>  {

            // First, trim any leading/trailing whitespace from the input string.
            // Then, split the string by newline characters.
            // The first line is assigned to 'N' (typically representing a count or length).
            // The second line (or remaining part) is assigned to 'S' (the actual data string).
            const   [   N,  S   ]   =   args    .   trim(   )   .   split   `\n`  ;

            // Convert the string 'S' into an array of numerical character codes.
            // Each character is transformed by:
            // 1. Splitting the string into individual characters.
            // 2. Mapping each character 'c' to its ASCII code.
            // 3. Subtracting 97 to make 'a' correspond to 0, 'b' to 1, and so on.
            const   s   =   S   .   split(   ``  )   .   map (   c   =>  c   .   charCodeAt(   )   -   97  )   ;

            // Initialize an array 'a' with 26 elements.
            // This array will be used to store counts for each letter (a-z).
            // Each element is initially set to 1. This is a common pattern
            // when calculating products of frequencies where each frequency must be at least 1.
            const   a   =   Array   (   26  )   .   fill(  1  )   ;

            // Define the modulo constant. This is a large prime number
            // often used in competitive programming to prevent integer overflow
            // in calculations that involve very large intermediate products.
            const   MOD =   1e9 +   7   ;

            /*
             * Define a custom modular multiplication function 'mul'.
             * This function takes two numbers, 'a' and 'b', and returns their product modulo MOD.
             * It employs a technique to handle potential overflows before the modulo operation
             * by splitting 'a' into two parts (effectively (a_high * 2^16) + a_low).
             * This ensures that intermediate products remain within a manageable range for standard JS numbers.
             */
            const   mul =   (   a,  b   )   =>  (
                                                (   (   a   >>  16  )   *   b   %   MOD   *   65536   )
                                                +   (   (   a   &   65535   )   *   b   )
                                            )   %   MOD   ;

            // Loop through the processed character code array 's'.
            // The loop runs 'N' times, where 'N' is the value parsed from the first line of input.
            // For each character code `s[i]`, increment the corresponding counter in array `a`.
            // This effectively counts the occurrences of each letter in the input string 'S'.
            for (   let i   =   0   ;   i   <   N   ;   i++ )   {
                a   [   s   [   i   ]   ]   ++  ;
            }

            // Calculate the final result.
            // 1. Use the 'reduce' method on array 'a' to compute the product of all its elements.
            //    The custom 'mul' function is used for modular multiplication at each step.
            // 2. Subtract 1 from the final product.
            // 3. Convert the numerical result to a string using a template literal.
            return  `${  a   .   reduce(   mul   )   -   1   }`  ;
        }
    )
    (
        /*
         * This part of the IIFE reads the input.
         * It uses Node.js's 'fs' (file system) module.
         * 'readFileSync' reads the content of '/dev/stdin' (standard input).
         * The 'utf8' encoding is specified to correctly interpret the input characters.
         */
        require (   'fs'    )   .   readFileSync   (   '/dev/stdin'    ,   'utf8'  )
    )
)   ;