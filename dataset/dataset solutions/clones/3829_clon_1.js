/*
 * This is a Type I clone of an original JavaScript function.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */
function Main(  input  ) { // Function declaration with extra spaces
    // First, process the input string.
    const inputs   =   input.split(  /\s/g  )  ; // More spaces around operator and regex
    const str      =   inputs[0]  ; // Aligned assignment
    const target   =   inputs[1]  -  1  ; // Spaces around arithmetic operator
    const max      =   str.length  ; // Another aligned assignment

    /*
     * Generate all possible substrings of 'str'.
     * This involves nested mapping to create a 2D array of substrings.
     */
    const patterns = new Array(max)
        .fill('') // Initialize with empty strings
        .map((value1, index1) => {
            // Inner map for substrings starting at index1
            return new Array(max)
                .fill('') // Fill inner array
                .map((value2, index2) => {
                    // Extract substring from index1 with length index2
                    return str.substr(index1, index2);
                });
        });

    // Initialize an array to hold all patterns, starting with the full string.
    const allPattern = [  str  ]  ;

    // Flatten the 'patterns' array into 'allPattern'.
    patterns.forEach(  (values)  =>  {
        allPattern.push(  ...values  )  ; // Use spread operator
    }  )  ;

    /*
     * Process the collected patterns:
     * 1. Filter out empty strings.
     * 2. Sort them alphabetically.
     * 3. Filter out duplicate entries to get unique substrings.
     */
    const result = allPattern
        .filter(  (value)  =>  value  ) // Remove falsy values (empty strings)
        .sort(  ) // Sort alphabetically
        .filter(  (x,  i,  self)  =>  self.indexOf(x)  ===  i  )  ; // Get unique elements

    // Finally, print the target element from the unique sorted list.
    console.log(  '%s'  ,  result[target]  )  ;
} // End of Main function

// Call the Main function with input read from stdin.
Main(  require(  "fs"  )  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;