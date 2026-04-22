/*
 * This is a self-executing asynchronous function.
 * It processes standard input to perform some calculations.
 * The overall goal appears to be some form of optimization or division
 * of resources/tasks, where 'k' iterations refine the distribution.
 */
( async    (  )   =>    {

    // Initialize an empty string to accumulate all incoming standard input data.
    let   input   =   '';

    /*
     * Asynchronously iterate over chunks received from standard input (process.stdin).
     * Each chunk is appended to the 'input' string until all input is consumed.
     */
    for await (const chunk of process.stdin) {
        input += chunk; // Accumulate the chunk into the input string.
    }

    // Split the accumulated input string into an array of lines, using newline characters as delimiters.
    const   lines   =   input.split(/\n/);

    /*
     * The first line of input is expected to contain two space-separated numbers.
     * - `lines.shift()` removes and returns the first line.
     * - `.split(/\s/)` splits this line into an array of strings based on whitespace.
     * - `.map(v => +v)` converts each string part into a number.
     * - Array destructuring `[n, k]` assigns these two numbers to variables `n` and `k`.
     *   `n` likely represents the initial number of items, and `k` the number of operations.
     */
    const   [n, k]   =   lines.shift().split(/\s/).map(v => +v);

    /*
     * Process the second line of input (which is now `lines[0]` after `shift()`):
     * - `lines[0].split(/\s/)` splits the line into string elements.
     * - `.slice(0, n)` takes only the first `n` elements.
     * - `.map(v => [+v, +v, 1])` transforms each number `v` into a triplet array:
     *   `[original_value, current_value, count]`.
     *   Initially, `original_value` and `current_value` are the same, and `count` is 1.
     * - `.sort((a, b) => b[1] - a[1])` sorts the entire array `a` in descending order
     *   based on the `current_value` (the second element, index 1) of each triplet.
     */
    let   a   =   lines[0].split(/\s/).slice(0, n).map(v => [+v, +v, 1]).sort((a, b) => b[1] - a[1]);


    // This loop performs 'k' iterations, representing 'k' optimization steps.
    for (let i = 0; i < k; i++)
    {
        // In each iteration, 'max' refers to the first element in 'a',
        // which currently has the highest 'current_value' due to sorting.
        let   max   =   a[0];

        // Increment the count for this 'max' element. This implies dividing its value further.
        max[2]++;

        /*
         * Recalculate the 'current_value' (index 1) for the 'max' element.
         * The new 'current_value' is its `original_value` (index 0) divided by its `new_count` (index 2).
         * This new value is assigned to `max[1]` and also stored in the `divided` constant.
         */
        const   divided   =   max[1]   =   max[0]   /   max[2];

        // Initialize an index `j` to 1. This index will be used to find the new sorted position for `max`.
        let   j   =   1;

        /*
         * This `while` loop finds the correct position `j` in the array `a`
         * where the updated `max` element should be re-inserted to maintain the sorted order.
         * It continues as long as `a[j]` exists and its 'current_value' (`a[j][1]`)
         * is still greater than the new `divided` value of `max`.
         */
        while   (a[j]   &&   a[j][1]   >   divided) {
            j++; // Move to the next element.
        }

        /*
         * Reconstruct the array 'a' by effectively moving the updated 'max' element
         * from its original position (index 0) to its new sorted position (`j`).
         * - `a.slice(1, j)`: Takes all elements from index 1 up to (but not including) `j`.
         * - `.concat([max])`: Appends the updated `max` element as a single-element array.
         * - `.concat(a.slice(j, n))`: Appends the remaining elements from index `j` to `n-1`.
         * This ensures `a` remains sorted after `max`'s value changes.
         */
        a   =   a.slice(1, j).concat([max]).concat(a.slice(j, n));
    }

    // After all 'k' iterations, print the ceiling of the 'current_value' of the first element in 'a'.
    // This will be the final maximum current value after all divisions/optimizations.
    console.log(Math.ceil(a[0][1]));

} ) ( ); // Self-executing anonymous asynchronous function call.