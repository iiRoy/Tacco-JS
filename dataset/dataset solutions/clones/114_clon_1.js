/*
 * This JavaScript code is designed to read numerical input
 * from standard input, count the occurrences of each number,
 * and then output the number(s) that appear most frequently.
 * It assumes numbers are provided one per line.
 */

// Initialize an empty array 'a'. This array will be used
// to store the frequency counts of numbers.
// 'b' is a loop counter, initialized to 100.
// 'c' will keep track of the maximum frequency encountered so far.
for (
    a = [],
    b = 100;
    b--;
)
    // Initialize each element of array 'a' from index 0 to 99 with 0.
    // This also implicitly initializes 'c' to 0 for the first iteration.
    c = a[b] = 0;



// Read the entire content of standard input synchronously.
// The input is expected to be UTF-8 encoded text.
require(
    "fs"
)
    .readFileSync(
        "/dev/stdin",
        "utf8"
    )
    // Split the input string into an array of lines based on the newline character.
    .split(
        '\n'
    )
    // Iterate over each line using the 'some' method.
    // 'some' is used here for its iteration capability, not for its short-circuiting nature
    // based on truthy return values, as the callback always returns undefined (falsy).
    .some(
        function (
            i // 'i' represents the current line (string) from the input.
        ) {
            // Convert the line 'i' to a number using the unary plus operator.
            // If the conversion results in a non-zero number (truthy value),
            // then proceed with processing this number.
            if (
                +i
            ) {
                // Increment the count for the number represented by '+i' in array 'a'.
                // If 'a[+i]' was undefined, it will be treated as 0 and then incremented.
                a[+i]++;

                // Update 'c' (the maximum frequency) if the current number's frequency
                // (a[+i]) is greater than the current maximum frequency 'c'.
                c = a[+i] > c
                    ? a[+i]
                    : c;
            }
        }
    );


// After processing all input lines, iterate through the frequency array 'a'.
// Again, 'some' is used for iteration.
a.some(
    function (
        i, // 'i' represents the frequency (count) of a number.
        j  // 'j' represents the index, which corresponds to the number itself.
    ) {
        // Check if the frequency 'i' of the current number 'j'
        // is equal to the maximum frequency 'c' found.
        if (
            i == c
        ) {
            // If it is, then 'j' is one of the most frequent numbers.
            // Print this number 'j' to the console.
            console.log(
                j
            );
        }
    }
);