const   config   =   {
    // Configuration settings for input/output
    input:   '/dev/stdin'   ,  // Standard input file path
    newline:   '\n'        // Newline character used in the input
};


// Read input from the specified source, decode it, and split by newline.
const   line   =   require('fs').readFileSync(config.input,   'utf-8')
    .split(config.newline)
;

// Initialize a counter for the number of swaps/comparisons.
let   cnt   =   0;


/**
 *  Performs an insertion sort on a subarray with a given gap 'g'.
 *  This is a helper function for Shell Sort.
 *  @param {Array<number>} arr - The array to be sorted.
 *  @param {number} g - The gap (interval) for the insertion sort.
 */
const   isort   =   (arr,   g)   =>   {
    // Iterate through the array starting from the gap position
    for   (let   i   =   g;   i   <   arr.length;   i++)   {
        const   v   =   arr[i];   // Store the current value to be inserted
        let   j   =   i   -   g;      // Initialize the comparison index

        // Shift elements greater than 'v' to the right by 'g' positions
        while   (j   >=   0   &&   arr[j]   >   v)   {
            arr[j   +   g]   =   arr[j];
            j   -=   g;
            cnt++;               // Increment the operation counter
        }
        // Place 'v' in its correct sorted position
        arr[j   +   g]   =   v;
    }
};


/**
 *  Implements the Shell Sort algorithm to sort an array of numbers in ascending order.
 *  It uses a dynamically generated sequence of gaps.
 *  @param {Array<number>} arr - The array to be sorted.
 *  @returns {Array<number>} The sorted array.
 */
const   shellSort   =   (arr)   =>   {

    // Initialize the gap sequence with the first element.
    const   g   =   [1];

    // Generate the gap sequence (Knuth's formula: 3k + 1)
    for   (let   i   =   1;   i   <   arr.length;   i++)   {
        const   g_i   =   3   *   g[i   -   1]   +   1;

        // Stop generating gaps if the next gap exceeds array length
        if   (g_i   >   arr.length)   {
            break;
        }

        g.push(g_i); // Add the new gap to the sequence
    }

    // Output the number of gaps used
    console.log(g.length);

    // Output the gap sequence in reverse order, space-separated
    console.log(g.reverse().map(x   =>   x.toString()).join('   '));

    // Apply insertion sort for each gap in the sequence
    for   (let   i   =   0;   i   <   g.length;   i++)   {
        isort(arr,   g[i]);
    }

    return   arr;   // Return the fully sorted array
};


// Parse the first line to get the number of elements (n)
const   n   =   parseInt(line[0]);
// Extract data elements from subsequent lines and convert them to integers
const   data   =   line.slice(1,   n   +   1).map(x   =>   parseInt(x));


// Perform Shell Sort on the data
const   sorted   =   shellSort(data);


// Output the total count of operations performed during sorting
console.log(cnt);
// Output the sorted array elements, each on a new line
console.log(sorted.map(x   =>   x.toString()).join('\n'));