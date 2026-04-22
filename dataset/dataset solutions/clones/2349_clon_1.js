"use strict"; /* This directive enforces strict mode parsing and execution, helping to catch common coding errors and "unsafe" actions. */

const main = arg => {
    // Trim leading/trailing whitespace from the input string and split it into an array of lines.
    arg = arg.trim().split("\n");

    // Parse the first line of the input as an integer, which represents N.
    const N = parseInt(arg[0]);

    // Remove the first element (N) from the 'arg' array, so 'arg' now contains only the answer lines.
    arg.shift();

    // Assign the remaining lines to 'answers'.
    const answers = arg;

    // Initialize an empty array 'map' which will store information about each person.
    const map = [];

    // Initialize an empty array 'As' which will store parsed answer details for each person.
    const As = [];

    // Initialize a counter 'cnt' to 0. This will be used later in calculations.
    let cnt = 0;

    // Loop N times to initialize the 'map' array.
    for (let i = 0; i < N; i++) {
        /*
         * For each person (index i), create an object in 'map'.
         * Each object has properties:
         *   '0': count of "unkind" statements made *about* this person.
         *   '1': count of "kind" statements made *about* this person.
         *   'unkindFrom': array of indices of people who made an "unkind" statement about this person.
         *   'unkindFor': array of indices of people about whom this person made an "unkind" statement.
         */
        map[i] = {
            0: 0,
            1: 0,
            unkindFrom: [],
            unkindFor: []
        };
    }

    // Process the raw 'answers' to populate the 'As' array with structured data.
    for (let i = 0; i < answers.length; i++) {
        // Parse the current line as an integer, representing the number of statements (A) made by person 'i'.
        let A = parseInt(answers[i]);

        // Extract the A statements made by person 'i' and push them into the 'As' array.
        // `~~i` is a trick for `Math.floor(i)` or `parseInt(i)` for positive numbers.
        As.push(answers.slice(~~i + 1, ~~i + A + 1));

        // Advance the loop counter 'i' by 'A' to skip the statements just processed.
        // This ensures the loop correctly moves to the next person's statement count.
        i = parseInt(i) + parseInt(A);
    }

    // Iterate through the structured statements in 'As' to populate the 'map'.
    for (let i in As) {
        // For each person's statements (As[i])...
        for (let j in As[i]) {
            // Split the statement "X Y" into X and Y.
            const statementParts = As[i][j].split(" ");
            const X = parseInt(statementParts[0]); // The person being referred to (1-indexed).
            const Y = parseInt(statementParts[1]); // The kind/unkind status (1 for kind, 0 for unkind).

            // Increment the count for person (X-1) based on the statement's truth value (Y).
            map[X - 1][Y]++;

            // If the statement is "unkind" (Y === 0).
            if (Y === 0) {
                // Record that person 'i' made an "unkind" statement about person (X-1).
                map[X - 1].unkindFrom.push(parseInt(i));
                // Record that person 'i' made an "unkind" statement about person (X-1).
                map[i].unkindFor.push(X - 1);
            }
        }
    }

    // console.log("Parsed As array:", As); // Debugging line (commented out)
    // console.log("Map structure:", JSON.stringify(map, null, 2)); // Debugging line (commented out)

    // Initialize a second counter 'cnt2' to 0.
    let cnt2 = 0;

    // Iterate through the 'map' to find inconsistencies and update counters.
    for (let i in map) {
        // If a person has both "unkind" (0) and "kind" (1) statements made about them,
        // it implies a contradiction or a complex scenario.
        if (map[i][0] >= 1 && map[i][1] >= 1) {
            // Add the number of "unkind" statements made about this person to 'cnt'.
            cnt += map[i][0];
        }

        // Check for mutual "unkind" statements.
        for (let j in map[i].unkindFrom) {
            /*
             * If person 'i' was called "unkind" by someone (map[i].unkindFrom[j]),
             * check if person 'i' also called that same someone "unkind" (map[i].unkindFor).
             * This detects reciprocal "unkind" statements.
             */
            if (map[i].unkindFor.filter(n => n === map[i].unkindFrom[j]).length) {
                cnt2++; // Increment 'cnt2' for each such reciprocal pair found.
            }
        }
    }

    // The final result is N minus the sum of 'cnt' and half of 'cnt2'.
    // 'cnt2' is divided by 2 because each reciprocal pair is counted twice (once from each side).
    console.log(N - (cnt + (cnt2 / 2)));
};

// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));