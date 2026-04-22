/* This is the main entry point for the program.
 * It processes input from stdin to simulate string operations.
 *
 * @param {string} input - The raw input string read from standard input.
 */
function Main
(
    input
)
{
    // First, process the raw input string.
    // It's trimmed, split by newlines, and then each line is split by spaces.
    input = input
                .trim() /* Remove leading/trailing whitespace */
                .split("\n") // Split the input into an array of lines
                .map(
                    function (x)
                    {
                        return x.split(" "); /* Split each line by space characters */
                    }
                );


    /* Extract the initial string 'S' from the processed input.
     * It's the first element of the first line.
     */
    var S = input[0][0];


    // Parse the number of queries 'Q' from the second line of input.
    var Q = parseInt(input[1], 10); // Base 10 is specified for safety.


    // Initialize an array to store the query details.
    var arr_qu = [];


    /* Loop through the input to populate the query array.
     * Queries start from the third line (index 2).
     */
    for (
        var i = 0;
        i < Q;
        i++
    )
    {
        arr_qu.push(input[i + 2]);
    }


    /* Initialize a virtual string array 'v_S'.
     * Its length is generously sized to accommodate string growth from queries.
     * The initial string 'S' will be placed in the middle.
     */
    var v_S = Array.from(
        {
            length: (S.length + Q * 2)
        },
        () => ''
    );


    // Initialize pointers for the head and tail of the virtual string.
    // tmpHead points to the beginning of the active string segment.
    var tmpHead = Q;

    // tmpTail points to the end of the active string segment.
    var tmpTail = Q + S.length - 1;

    /* A temporary variable used for swapping pointers during reverse operations. */
    var tmp;


    /* Populate the virtual string array 'v_S' with the initial string 'S'.
     * 'S' is placed starting at index 'Q' to allow prepending characters later.
     */
    for (var i = 0; i < S.length; i++)
    {
        v_S[i + Q] = S.substr(i, 1);
    }


    // Process each query one by one.
    for (
        var i = 0;
        i < Q;
        i++
    )
    {
        // Check the type of query.
        // Query type '1' indicates a string reversal operation.
        if (arr_qu[i][0] === '1')
        {
            // Reverse the entire virtual string array.
            v_S = v_S.reverse();

            // Adjust head and tail pointers after reversal.
            // This is a crucial step to maintain correct indexing in the reversed array.
            tmp = tmpHead;
            tmpHead = Q - (tmpTail - (Q + S.length - 1));
            tmpTail = Q + S.length - 1 + (Q - tmp);

            // Move to the next query.
            continue;
        }

        // Query type '2' (arr_qu[i][0] !== '1') involves adding characters.
        // Check if the character should be added to the head (front) of the string.
        if (arr_qu[i][1] === '1')
        {
            // Decrement the head pointer to make space for the new character.
            tmpHead--;
            // Place the new character at the new head position.
            v_S[tmpHead] = arr_qu[i][2];

            // Move to the next query.
            continue;
        }

        // If not a reverse operation and not adding to the head,
        // then the character must be added to the tail (end) of the string.
        tmpTail++; // Increment the tail pointer.
        v_S[tmpTail] = arr_qu[i][2]; // Place the new character at the new tail position.
    }


    /* Finally, join the active part of the virtual string array
     * from tmpHead to tmpTail, and print the result to console.
     */
    console.log(v_S.join(''));
}


// --- Program Execution Start ---
/* Read the input from standard input (/dev/stdin)
 * using Node.js 'fs' module and pass it to the Main function.
 * The input is read as UTF-8 encoded text.
 */
Main(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);