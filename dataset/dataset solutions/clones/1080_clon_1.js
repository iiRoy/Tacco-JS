/*
 * This JavaScript file contains two primary functions:
 * CS (Counting Sort) and Main.
 * The Main function processes input data, performs sorting,
 * and calculates a specific result based on array manipulations.
 */

var n; // Global variable 'n' to store the size of arrays.

/**
 * Implements the Counting Sort algorithm.
 *
 * @param {Array<number>} a - The input array to be sorted.
 * @param {Array<number>} b - The output array where sorted elements will be placed.
 * @param {number} k - The maximum value (range) of elements in array 'a'.
 */
function CS(a, b, k) {
    // Declare a temporary counting array 'c' of size k+1, initialized to zeros.
    var c = new Array(k + 1);

    // Initialize all elements of the counting array 'c' to 0.
    for (var i = 0; i <= k; i++) {
        c[i] = 0;
    }


    // Count the occurrences of each element in the input array 'a'.
    // 'n' is assumed to be the global size of the array 'a'.
    for (var j = 0; j < n; j++) {
        c[a[j]]++;
    }

    // Modify the counting array 'c' to store the actual position
    // of each element in the output array 'b'.
    for (var i = 1; i <= k; i++) {
        c[i] += c[i - 1];
    }

    /*
     * Build the output array 'b' using the modified counting array.
     * Iterate through the input array 'a' in reverse to maintain stability,
     * though the original code iterates forward.
     * The original code uses a forward iteration: j from 0 to n-1.
     * This means it's not a stable sort if elements are identical.
     * But for the problem context, it seems to work.
     */
    for (var j = 0; j < n; j++) {
        // Place a[j] into its sorted position in b.
        // Decrement c[a[j]] to handle duplicate elements correctly.
        b[-1 + c[a[j]]--] = a[j];
    }
}


/**
 * The main function that processes the input and orchestrates the logic.
 *
 * @param {string} input - The raw input string, typically from stdin.
 */
function Main(input) {
    // Split the input string by newlines to get individual lines.
    input = input.split("\n");

    // Parse the first line to get the value of 'n' (number of elements).
    n = parseInt(input[0], 10);

    // Declare two arrays, 'w' and 's', both of size 'n'.
    // 'w' will store the initial weights, 's' will store the sorted weights.
    var w = new Array(n),
        s = new Array(n);

    // Split the second line of input by spaces to get individual weight values.
    input[1] = input[1].split(" ");

    // Populate the 'w' array by parsing the weight strings into integers.
    for (var i = 0; i < n; i++) {
        w[i] = parseInt(input[1][i], 10);
    }


    // Call the Counting Sort function to sort the 'w' array into 's'.
    // The maximum possible value for elements is assumed to be 10000.
    CS(w, s, 10000);


    // Initialize 'sum' for counting matches and declare 'pl', 'pl2' arrays.
    var sum = 0,
        pl = new Array(n),
        pl2 = new Array(n);

    // Calculate the initial number of elements that are already in their sorted positions.
    for (var i = 0; i < n; i++) {
        sum += (w[i] == s[i]);
    }

    // Determine the permutation mappings:
    // pl[i] stores the index j such that w[i] == s[j].
    // pl2[j] stores the index i such that w[i] == s[j].
    // This establishes the current position of each element from 'w' in the sorted 's'.
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            if (w[i] == s[j]) {
                pl[i] = j;
                pl2[j] = i;
            }
        }
    }

    // Declare 'ex' for temporary swaps and 'ans' for the final accumulated answer.
    var ex,
        ans = 0;

    // First pass: Handle 2-cycles (swaps of two elements that are out of place).
    // If w[i] should be at pl[i], and w[pl[i]] should be at i, and i != pl[i].
    for (var i = 0; i < n; i++) {
        if (pl[pl[i]] == i && pl[i] != i) {
            // If a 2-cycle is found, it means two elements need to be swapped.
            // This operation fixes two elements, so 'sum' increases by 2.
            sum += 2;
            // Add the sum of the two elements' values to the answer.
            ans += w[i] + w[pl[i]];

            // Perform the swap of values in 'w' array.
            ex = w[i];
            w[i] = w[pl[i]];
            w[pl[i]] = ex;

            // Update the 'pl2' mapping to reflect the swap.
            // This part of the original code has a logical flaw for pl2 update.
            // It seems to intend to update pl2[i] and pl2[pl[i]] based on the swap.
            // Original: ex = pl2[i]; pl2[i] = pl2[pl[i]]; pl2[ex] = ex;
            // This seems to be a mistake. A direct Type I clone means I must keep it as is.
            ex = pl2[i]; // Store original pl2[i]
            pl2[i] = pl2[pl[i]]; // pl2[i] now points to the original pl2[pl[i]]
            pl2[ex] = ex; // This line is problematic: it overwrites pl2 at ex with ex itself.
                          // It should likely be: pl2[pl[i]] = ex; to update the other end of the swap.

            // Update the 'pl' mapping to reflect the swap.
            // This also has a similar pattern to the pl2 update, suggesting a potential flaw.
            // Original: ex = pl[i]; pl[i] = pl[pl[i]]; pl[ex] = ex;
            // This is also problematic.
            ex = pl[i]; // Stores the target index for w[i]
            pl[i] = pl[pl[i]]; // Updates pl[i] to point to where w[pl[i]] should go
            pl[ex] = ex; // Overwrites pl at ex with ex.
                         // It should likely be: pl[pl[i]] = ex; to update the other end.
        }
    }


    // Second pass: Handle cycles longer than 2.
    // Continue until all elements are in their sorted positions (sum == n).
    while (sum < n) {
        // Find the minimum value among elements that are not yet in their correct position.
        var min = 1000000,
            mini;
        for (var i = 0; i < n; i++) {
            if (min > w[i] && pl[i] != i) { // Check if element is out of place.
                min = w[i];
                mini = i;
            }
        }

        // Process the cycle starting from 'mini'.
        // Continue until 'mini' itself is in its correct place (pl[mini] == mini).
        while (pl[mini] != mini) {
            // Add the cost of swapping 'mini' with its predecessor in the cycle.
            // This involves w[mini] (the current element) and w[pl2[mini]] (the element that wants to be at mini's current spot).
            ans += w[mini] + w[pl2[mini]];

            // Perform the swap of values in 'w' array.
            ex = w[mini];
            w[mini] = w[pl2[mini]];
            w[pl2[mini]] = ex;

            // Update 'pl' mapping.
            // This also appears to have the same pattern as the earlier potentially flawed update.
            ex = pl[mini]; // Stores where w[mini] *should* go
            pl[mini] = pl[pl2[mini]]; // Updates pl[mini] to where w[pl2[mini]] *should* go
            pl[pl2[mini]] = ex; // Updates pl[pl2[mini]] to where w[mini] *should* go (original ex)

            // Update 'pl2' mapping.
            // Similar pattern, potentially flawed logic for a correct cycle update.
            ex = pl2[mini]; // Stores the element that is currently at pl2[mini]
            pl2[pl[pl2[mini]]] = pl2[mini]; // Updates pl2 for the new position of pl2[mini]
            pl2[mini] = mini; // Sets mini's pl2 to itself, indicating it's now in place (incorrect, this ends the inner loop for mini)

            mini = ex; // Move to the next element in the cycle.
            sum++; // Increment sum as one element is now correctly placed.

            // The following lines are commented out debugging statements from the original code.
            // console.log(w + "   " + pl + "   " + pl2 + "    " + mini); // break;
            // console.log(w + "  " + pl + " " + pl2 + "  " + mini);
        }
        sum++; // Increment sum again, as the whole cycle has been resolved.
    }

    // Output the final calculated answer.
    console.log(ans);
}

// Read input from stdin and pass it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));