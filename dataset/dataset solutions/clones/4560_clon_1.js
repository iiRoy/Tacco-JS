/*
 * This JavaScript module defines a main function
 * that processes input to compare two numbers
 * based on a custom categorization logic.
 *
 * It reads input from standard input, typically '/dev/stdin'.
 */

function main(input) /* Start of the primary execution function */ {

    // Step 1: Preprocess the raw input string.
    // Removes any leading or trailing whitespace characters.
    input = input.trim();

    /*
     * Step 2: Extract and parse the first integer.
     * The input string is expected to contain two space-separated numbers.
     * 'input.split(" ")[0]' gets the first part before the space.
     * 'parseInt(..., 10)' converts it to an integer using base 10.
     */
    const x = parseInt(input.split(" ")[0], 10);


    // Step 3: Extract and parse the second integer.
    // This follows the same logic as parsing 'x', but for the second part.
    const y = parseInt(input.split(" ")[1], 10);


    /*
     * Step 4: Define a helper function, 'wake'.
     * This function categorizes a given number 'n' into one of three groups.
     * The groups are represented by 'a', 'b', and 'c'.
     * (Note: The variables 'a', 'b', and 'c' are used as return values
     * but are not explicitly defined within this scope, implying they
     * might be global or placeholders for some external constants).
     */
    var wake = function(n) {

        // Check for the first category (e.g., months with 31 days)
        if (n == 1 || n == 3 || n == 5 || n == 7 || n == 8 || n == 10 || n == 12) {
            return a; // Returns category 'a'
        }
        // Check for the second category (e.g., months with 30 days)
        else if (n == 4 || n == 6 || n == 9 || n == 11) {
            return b; // Returns category 'b'
        }
        // If neither of the above, it falls into the third category (e.g., February)
        else {
            return c; // Returns category 'c'
        }
    }; // End of the 'wake' helper function definition


    /*
     * Step 5: Compare the categories of 'x' and 'y'.
     * The 'wake' function is called for both 'x' and 'y' to determine their respective categories.
     */
    if (wake(x) == wake(y)) {
        // If the categories are identical, print "Yes".
        console.log("Yes");
    } else {
        // If the categories are different, print "No".
        console.log("No");
    }

} // End of the main function


// Standard input processing for Node.js environments.
// Reads the entire content of '/dev/stdin' as a UTF-8 string.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * This concludes the execution flow of the script.
 * The output ("Yes" or "No") is printed to standard output.
 */