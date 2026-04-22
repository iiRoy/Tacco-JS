"use strict"; // This directive enables strict mode for the entire script, enforcing cleaner code.

// Import the 'fs' (file system) module, which provides methods for interacting with the file system.
// This is a standard Node.js built-in module.
const     fs = require("fs")   ;


/**
 * The main entry point function for the program.
 * It processes the input to determine if a bingo condition is met.
 * @param {string} input - The raw input string, typically read from standard input.
 */
function main (  input  )
{
        // Step 1: Parse the input string.
        // Split the entire input content by newline characters to get an array of lines.
    const tmp = input.split(  "\n"  )  ;


    // Step 2: Extract the bingo card data.
    // The first three lines of the input represent the 3x3 bingo card.
    // Each line is further split by spaces to get individual numbers for each row.
    const   card = tmp.slice(0, 3).map(    v => v.split(" ")    )   ;

    // The fourth line (index 3 in the 'tmp' array) is 'n',
    // which indicates the number of called numbers.
    // This variable 'n' is read but not actually utilized in the bingo checking logic.
    const n = tmp[3]   ;

    // The remaining lines (from index 4 onwards) contain the numbers that are called out.
    const   bs = tmp.slice(  4  )  ;


    // Step 3: Initialize the 'check' matrix.
    // Create a 3x3 boolean array to keep track of which numbers on the card have been called.
    // Initially, all positions are set to 'false' (unmarked).
    const check = []  ;
    for (let i = 0; i < 3; i++)
    {
        // For each row 'i', create a new array of 3 boolean values.
        check[i] = new Array(3).fill(false)  ;
    }


    // Step 4: Mark numbers on the card.
    // Iterate through each number 'b' that was called.
    for (let b of bs)
    {
        // For every called number, we need to scan the entire 3x3 card.
        for (let i = 0; i < 3; i++)
        {
            // Iterate through columns.
            for (let j = 0; j < 3; j++)
            {
                // If the number at the current card position (i, j) matches the called number 'b',
                // then mark that position as 'true' in our 'check' matrix.
                if (card[i][j] === b)
                {
                    check[i][j] = true   ;
                }
            }
        }
    }


    // Step 5: Check for bingo conditions.
    // A bingo occurs if any row, any column, or either of the two main diagonals are completely marked.

    // The extensive conditional statement checks all possible bingo lines:
    if (
           check[0][0] && check[0][1] && check[0][2] // Check if the first row is completely marked.
        || check[1][0] && check[1][1] && check[1][2] // Check if the second row is completely marked.
        || check[2][0] && check[2][1] && check[2][2] // Check if the third row is completely marked.
        || check[0][0] && check[1][0] && check[2][0] // Check if the first column is completely marked.
        || check[0][1] && check[1][1] && check[2][1] // Check if the second column is completely marked.
        || check[0][2] && check[1][2] && check[2][2] // Check if the third column is completely marked.
        || check[0][0] && check[1][1] && check[2][2] // Check if the main diagonal (top-left to bottom-right) is marked.
        || check[0][2] && check[1][1] && check[2][0] // Check if the anti-diagonal (top-right to bottom-left) is marked.
       )
    {
        // If any of the bingo conditions are met, print "yes" to standard output.
        console.log("yes")   ;
    }
    else
    {
        // If none of the bingo conditions are met after checking all possibilities, print "no".
        console.log("no")    ;
    }

} // End of the 'main' function definition.


// This line is the entry point for execution when the script is run.
// It reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes the resulting string to the 'main' function.
main(  fs.readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;