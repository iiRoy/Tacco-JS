/* This global variable keeps track of the number of inversions or comparisons,
 * depending on the specific problem context. It is incremented within the
 * merge function. */
var cnt = 0;

// Main execution block: an Immediately Invoked Function Expression (IIFE)
(  function main(  )
{
    // Retrieve input from standard input, process it.
    const lines = require('fs').readFileSync(
        '/dev/stdin',
        'utf8'
    ) .trim(  ) .split('\n');

    // Parse the first line as the number of elements (n).
    const n = Number(  lines.shift(  )  );

    /* The second line contains the array elements,
     * which are space-separated and need to be converted to numbers. */
    let arr = lines.shift(  ) .split(' ') .map(  Number  );

    // Call the mergeSort function to sort the array and count inversions.
    mergeSort(  arr, 0, n  );

    // The original code had a commented-out line for printing the sorted array.
    // console.log(arr.join(' '));

    // Print the final count of operations (inversions).
    console.log(  cnt  );
} ) (  );


/**
 * Merges two sorted subarrays into a single sorted array.
 * This function also increments the global counter 'cnt'
 * when an element from the right subarray is chosen before
 * an element from the left subarray, indicating an inversion.
 *
 * @param {Array<number>} arr   The array containing the two subarrays to merge.
 * @param {number}        left  The starting index of the first subarray.
 * @param {number}        mid   The ending index of the first subarray (and start of the second).
 * @param {number}        right The ending index of the second subarray.
 */
function merge(  arr, left, mid, right  )
{
    // Create temporary left and right subarrays.
    let L = arr.slice(  left, mid  );
    let R = arr.slice(  mid, right  );

    // Add sentinel values (Infinity) to the end of both temporary arrays
    // to simplify comparison logic and avoid out-of-bounds checks.
    L.push(  Infinity  );
    R.push(  Infinity  );

    // Initialize pointers for the left and right temporary arrays.
    let i = 0;
    let j = 0;

    // Iterate through the original array's merge range.
    for (  let k = left; k < right; k++  )
    {
        // Compare elements from L and R.
        if (  L[i] <= R[j]  )
        {
            // If L's element is smaller or equal, take it.
            arr[k] = L[i++];
        }
        else
        {
            // If R's element is smaller, take it.
            // This also means an inversion is found, so increment the counter.
            arr[k] = R[j++];
            cnt++;
        }
    }
}

/**
 * Implements the merge sort algorithm recursively.
 * It divides the array into two halves, sorts them, and then merges them.
 *
 * @param {Array<number>} arr   The array to be sorted.
 * @param {number}        left  The starting index of the current subarray.
 * @param {number}        right The ending index of the current subarray (exclusive).
 */
function mergeSort(  arr, left, right  )
{
    // Base case: if the subarray has 0 or 1 element, it's already sorted.
    if (  left + 1 < right  )
    {
        // Calculate the middle point to divide the array.
        let mid = Math.floor(  (  left + right  ) / 2  );

        // Recursively sort the left half.
        mergeSort(  arr, left, mid  );

        // Recursively sort the right half.
        mergeSort(  arr, mid, right  );

        // Merge the two sorted halves.
        merge(  arr, left, mid, right  );
    }
}