/*
 * This script is designed to process input from standard input,
 * perform a calculation using a recursive depth-first search (DFS) approach,
 * and then print the result to standard output.
 */

// Resumes the stdin stream, making it ready to receive data.
process . stdin . resume ( ) ;
// Sets the encoding for stdin to UTF-8 to handle text input correctly.
process . stdin . setEncoding ( 'utf8' ) ;


// A global variable to accumulate all incoming data from stdin.
var   g_input   =   ''   ;

/*
 * Event listener for 'data' event on stdin.
 * This callback appends each received chunk of data to g_input.
 */
process.stdin.on('data', function(chunk)
{
    g_input += chunk; // Concatenate the new chunk to the existing input string.
});


/*
 * Event listener for 'end' event on stdin.
 * This callback is triggered once all input data has been received.
 * It then splits the accumulated input by newlines and passes it to the Main function.
 */
process.stdin.on('end', function() {

    // Split the input string by either Windows (\r\n) or Unix (\n) newlines.
    Main(g_input.split(/\r?\n/));

});


/**
 * The main entry point of the program logic.
 * It parses the input, initializes an array, calls the DFS function,
 * and prints the final result.
 * @param {string[]} input - An array of strings, where each string is a line from the input.
 * @returns {number} - Returns 0 upon successful execution.
 */
function   Main   (   input   )
{
    // Parse the first line of input to get the integer 'n'.
    var n = parseInt(input[0], 10);

    // Split the second line of input by spaces to get an array of string numbers.
    var inputA = input[1].split(' ');

    // Initialize an array 'a' with a size of 'n'.
    var a = new Array(n);

    // Loop through 'inputA' to parse each string number into an integer and store it in array 'a'.
    for (var i = 0; i < n; i++)
    {
        a[i] = parseInt(inputA[i], 10);
    }

    // Call the recursive depth-first search function starting from index 0.
    var ans = dfs(0, a);

    // Print the final calculated answer to the console.
    console.log(ans);


    return 0; // Indicate successful execution.
}

/**
 * Recursive depth-first search function to calculate a value based on array elements.
 * @param {number} i - The current index in the array 'a'.
 * @param {number[]} a - The array of numbers being processed.
 * @returns {number} - The calculated value for the current state.
 */
function dfs(i, a) {
    // Base case: If the index 'i' is beyond the array length, return 0.
    if (i >= a.length) {
        return 0;
    }

    // Initialize ans1 to 1. This will be multiplied by 3 for each remaining element.
    var ans1 = 1;

    // Loop from the next element to the end of the array.
    for (var j = i + 1; j < a.length; j++)
    {
        ans1 *= 3; // Multiply ans1 by 3 for each subsequent element.
    }

    // Recursively call dfs for the next element (i + 1).
    var ans2 = dfs(i + 1, a);

    // Initialize the result variable.
    var ans = 0;

    // Check if the current element a[i] is even or odd.
    if (a[i] % 2 == 0)
    {
        // If a[i] is even, apply this specific formula.
        ans = ans1 + 2 * ans2;
    }
    else
    {
        // If a[i] is odd, apply this alternative formula.
        ans = 2 * ans1 + ans2;
    }

    // Return the calculated answer for the current step.
    return ans;
}