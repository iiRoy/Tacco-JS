// This is the main entry point function for the program, accepting raw input.
function   Main   (   input   )
{

    // Step 1: Clean up the input string by removing any unnecessary leading or trailing whitespace characters.
    input   =   input.trim   (   )   ;

    // Step 2: Process the cleaned input string.
    // It's split into an array of strings using space as a delimiter.
    // Then, each string element is converted into a numerical type using the Number constructor.
    input   =   input.split   (   " "   )   .map   (   Number   )   ;


    /**
     * This is a nested helper function designed to be used as a comparison function
     * for array sorting methods. It implements a standard ascending numerical sort.
     *
     * @param {number} a - The first number to be compared.
     * @param {number} b - The second number to be compared.
     * @returns {number} A negative value if 'a' should come before 'b',
     *                   a positive value if 'a' should come after 'b',
     *                   or zero if 'a' and 'b' are considered equal for sorting purposes.
     */
    function   compareFunc   (   a   ,   b   )
    {
        // Returns the difference, which dictates the sort order:
        // if a < b, result is negative (a comes before b)
        // if a > b, result is positive (a comes after b)
        // if a == b, result is zero (order doesn't change relative to each other)
        return   a   -   b   ;
    }

    // Step 3: Sort the array of numbers.
    // The 'compareFunc' ensures the array elements are sorted in ascending numerical order.
    input.sort   (   compareFunc   )   ;


    // Step 4: Perform the final calculation and output the result.
    // This calculation represents the area of a triangle, assuming the first two elements
    // of the sorted array are the base and height (e.g., for a right-angled triangle).
    // The formula is (base * height) / 2.
    console.log   (   input   [   0   ]   *   input   [   1   ]   /   2   )   ;
}

// This is the main execution block. It reads data from standard input,
// specifically from the /dev/stdin file (common in competitive programming environments),
// decodes it as UTF-8, and then passes this string content to the Main function for processing.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;