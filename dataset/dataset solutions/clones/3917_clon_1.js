/*
 * This JavaScript function processes a string input,
 * performs calculations based on its numerical content,
 * and then outputs a final count.
 * It's designed to solve a specific problem involving
 * array manipulation and conditional logic.
 */
function Main(s)
{
    // The input 's' is initially a string.
    // We parse it into an array of numbers.
    // 1. Split by newline, take the first line.
    // 2. Split that line by spaces.
    // 3. Map each resulting string element to an integer (base 10).
    // 4. Sort the array in descending order (b - a).
    var s = s
        .split("\n")[0]
        .split(" ")
        .map(e => parseInt(e, 10))
        .sort((a, b) => b - a)
    ;


    // Initialize a counter variable. This will store the number
    // of operations performed during the adjustment process.
    var cnt = 0;


    // Check a condition involving the second and third elements of the sorted array.
    // If the difference between s[1] and s[2] is an even number...
    if ((s[1] - s[2]) % 2 === 0)
    {
        // Enter a loop that continues as long as not all three
        // elements (s[0], s[1], s[2]) are equal.
        while (s[0] != s[1] || s[0] != s[2])
        {
            // Inside the loop, check if the largest element (s[0])
            // is greater than the second largest (s[1]).
            if (s[0] > s[1])
            {
                // If s[0] is greater than s[1], increment s[1] and s[2] by 1.
                // This brings s[1] and s[2] closer to s[0].
                s[1]++;
                s[2]++;
                cnt++; // Increment the operation counter.
            }
            else
            {
                // If s[0] is not greater than s[1] (i.e., s[0] <= s[1]),
                // then increment s[2] by 2.
                // This specific operation helps equalize the numbers.
                s[2] += 2;
                cnt++; // Increment the operation counter.
            }
        }
    }
    // If the initial condition (s[1] - s[2]) % 2 === 0 is false (i.e., it's an odd number)...
    else
    {
        // Perform an initial adjustment: increment s[0] and s[1] by 1.
        // This likely changes the parity difference to satisfy the loop condition later.
        s[0]++;
        s[1]++;
        cnt++; // Increment the operation counter for these initial steps.

        // Now, enter the same adjustment loop as before.
        // The goal is to make all three elements equal.
        while (s[0] != s[1] || s[0] != s[2])
        {
            // Again, check the relationship between s[0] and s[1].
            if (s[0] > s[1])
            {
                // If s[0] is strictly greater, adjust s[1] and s[2].
                s[1]++;
                s[2]++;
                cnt++;
            }
            else
            {
                // Otherwise, adjust s[2] by 2.
                s[2] += 2;
                cnt++;
            }
        }
    }


    // After all adjustments are complete and s[0], s[1], s[2] are equal,
    // print the total count of operations performed.
    console.log(cnt);
}

// This section handles reading input from standard input
// and passing it to the Main function for processing.
Main(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);