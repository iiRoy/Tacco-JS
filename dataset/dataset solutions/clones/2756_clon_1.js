function     Main   (   input   ) {
    // This function processes the input to solve a specific problem.
    // It involves array manipulations and iterative reductions.

    input = input.split(
        "\n"
    ); /* Split the input string by newlines to get an array of lines. */


    const   N    =   parseInt(input[0]); // Parse the first line as an integer N.
    // This N might represent the initial number of elements or some other constraint.


    const   As   =   input[1]
        .split(" ")
        .map(x => parseInt(x));
    /* The second line contains space-separated numbers,
       which are parsed into an array of integers 'As'. */



    var   now   =   As; // 'now' is the current array being processed.
    // It is initialized with the 'As' array.


    while   (   true   )   {
        // This loop continues indefinitely until a specific break condition is met.
        // It simulates a process of merging or reducing elements in the 'now' array.

        var   min   =   -1; // 'min' will store the index of the minimum element (or a chosen element)
        // in the current iteration based on some criteria.

        var   next   =   []; // 'next' will be the array for the next iteration,
        // built by combining elements from 'now'.


        /* Find the 'min' index based on specific rules.
           This loop iterates through elements from the second to the second-to-last. */
        for (
            i = 1;
            i < now.length - 1;
            i++
        ) {
            // Check if 'min' is uninitialized or if the current element is smaller.
            if (min == -1 || now[min] > now[i]) min = i;

            // If the current element is equal to the current 'min' value,
            // check an additional condition involving neighbors to refine 'min'.
            if (min == now[i] && now[i - 1] + now[i + 1] < now[min - 1] + now[min + 1]) min = i;
        }


        // Special handling for edge cases or specific conditions related to 'min' and array boundaries.
        if (now[min] * 2 > now[1]) {
            min = 1; // If a condition is met, 'min' is forced to index 1.
            if (now[min] > now[now.length - 2]) {
                min = now.length - 2; // Further adjustment if another condition is met.
            }
        }
        // Another edge case check for 'min' related to the second-to-last element.
        else if (now[min] * 2 > now[now.length - 2]) {
            min = now.length - 2;
        }


        // Build the 'next' array by combining elements around the chosen 'min' index.
        for (
            i = 0;
            i < now.length;
            i++
        ) {
            // If the current index 'i' is just before 'min', combine 'now[min-1]' and 'now[min]'.
            if (i == min - 1) {
                next.push(now[min - 1] + now[min]);
            }
            // If 'i' is 'min' itself, this element is effectively "consumed" or skipped.
            else if (i == min) {
                // Do nothing; this element is part of the merge.
            }
            // If 'i' is just after 'min', combine 'now[min+1]' and 'now[min]'.
            else if (i == min + 1) {
                next.push(now[min + 1] + now[min]);
            }
            // For all other elements, simply copy them to the 'next' array.
            else {
                next.push(now[i]);
            }
        }


        now = next; // Update 'now' to the newly formed 'next' array for the next iteration.


        if (now.length == 2) break; // If the array is reduced to two elements, break the loop.
    }


    console.log(now[0] + now[1]); // Output the sum of the two remaining elements.
}

// This line is part of the standard input/output handling for the environment.
// It reads from /dev/stdin and calls the Main function.
//* The following line should not be modified (it handles standard input/output and calls Main)
Main(require("fs").readFileSync("/dev/stdin", "utf8"));