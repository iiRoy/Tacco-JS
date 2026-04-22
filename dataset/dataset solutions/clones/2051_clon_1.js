Main = ( /* The primary entry point function for the program. */
        o /* This parameter receives the raw input string for processing. */
    ) => { /* Start of the Main function's execution block. */

    "use strict"; /* Enforce strict mode for cleaner and safer JavaScript code. */

    // The input 'o' is initially a single string containing multiple lines and words.
    // This line processes 'o' to extract the relevant data.
    o =
        o
        .split(
            "\n" /* Split the input string by newline characters to get an array of lines. */
        )[
            1 /* Access the second line (index 1) from the resulting array of lines. */
        ]
        .split(
            " " /* Split the selected line by spaces to obtain an array of individual words. */
        );
    // After this operation, 'o' is now an array of strings (words).

    // Declare and initialize an empty object named 't'.
    // This object will be used to store statistics about each unique word found in the input.
    let t = { /* An associative array to hold word counts and derived calculations. */ };

    // First loop: Iterate through each word in the processed input array 'o'.
    // The purpose of this loop is to count the occurrences of each unique word.
    for (
        const s /* 's' represents the current word being processed in this iteration. */
        of o /* Iterate over every element (word) in the array 'o'. */
    ) {
        // Increment the counter for the current word 's' in the 't' object.
        // If 't[s]' does not yet exist (i.e., the word is encountered for the first time),
        // the '|| 0' ensures it defaults to 0 before the increment.
        t[s] = (
                t[s] /* Retrieve the current count of word 's', if it exists. */
                ||
                0 /* If 't[s]' is undefined (first occurrence), use 0 as the base count. */
            ) +
            1 /* Add one to the current count, reflecting another occurrence of word 's'. */ ;
    }

    // Second loop: Iterate through the unique words that have been collected in the 't' object.
    // For each unique word, calculate and store specific combinatorial values.
    for (
        const o /* 'o' is reused here as the loop variable, representing a unique word key from 't'. */
        of Object.keys(
            t /* Get an array of all unique word keys present in the 't' object. */
        )
    ) {
        // Store the current count of the word 'o' before it gets overwritten by an object.
        // This count is essential for calculating the combinatorial values.
        const original_count_for_o = t[o];

        // Replace the simple count (a number) with a new object containing detailed statistics.
        t[o] = {
            a: original_count_for_o, // Property 'a': Stores the original count of the word (n).
            b: original_count_for_o * (original_count_for_o - 1) / 2, // Property 'b': Calculates 'n choose 2' (number of pairs).
            c: (original_count_for_o - 1) * (original_count_for_o - 2) / 2 // Property 'c': Calculates '(n-1) choose 2'.
        };
    }

    // Declare a variable 's' without an initial value.
    // This variable will act as an accumulator for sums calculated in the subsequent loop.
    var s;

    // Main processing loop: Iterate through the original sequence of words in array 'o'.
    // For each word in the input sequence, a specific sum 's' is calculated and then printed.
    for (
        let c = 0; /* Initialize loop counter 'c' to zero, representing the current index. */
        c < o.length; /* Continue looping as long as 'c' is less than the total number of words. */
        c++ /* Increment the counter 'c' after each successful iteration. */
    ) {
        // Extract the current word 'e' from the array 'o' at the current index 'c'.
        const e = o[c];

        // Reset the accumulator 's' to zero at the beginning of each iteration
        // for a new word 'e', ensuring an accurate sum for each word.
        s = 0;

        // Inner loop: Iterate over each unique word (key) stored in the 't' object.
        // This loop performs the core calculation for the sum 's'.
        for (
            const o /* 'o' is reused again as the loop variable, representing a unique word from 't'. */
            of Object.keys(
                t /* Retrieve an array of all unique word keys from the 't' object. */
            )
        ) {
            // Conditionally add either 't[o].c' or 't[o].b' to 's'.
            // This logic contributes to a specific combinatorial sum.
            s +=
                e == o ? /* Check if the current word 'e' matches the unique word 'o'. */
                t[o].c /* If they match, add the value of 't[o].c' to 's'. */ :
                t[o].b /* If they do not match, add the value of 't[o].b' to 's'. */ ;
        }

        // Output the final calculated sum 's' for the current word 'e' to the console.
        console.log(
            s /* The computed sum 's' for the current word 'e' is printed. */
        );
    }
}; // End of the definition for the 'Main' function.

// Immediately invoke the 'Main' function with input read from standard input.
Main(
    require(
            "fs" /* Load the Node.js 'fs' (file system) module to handle file operations. */
        )
        .readFileSync(
            "/dev/stdin", /* Specify the path to standard input, where the program expects data. */
            "utf8" /* Define the character encoding to use when reading the input data. */
        )
        .trim() /* Remove any leading or trailing whitespace (including newlines) from the input string. */
); /* End of the program execution. */