// This section reads all input lines from standard input,
// assuming a Unix-like environment where '/dev/stdin' is accessible.
// It then splits the input into an array of strings, one for each line.
const   inputLines    =   require   (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,
                                                                   'utf-8'   )
                                                                   .  split  (  '\n'  )   ;

// Initialize a counter for comparison operations performed during sorting.
let comparisonCount =   0   ;


/**
 * Merges two sorted subarrays into a single sorted array.
 * This function is a core component of the merge sort algorithm.
 *
 * @param {Array<number>} workingArray  - The array containing the subarrays to be merged.
 * @param {number}        startIdx      - The starting index of the first subarray.
 * @param {number}        middleIdx     - The ending index of the first subarray (exclusive)
 *                                        and the starting index of the second subarray.
 * @param {number}        endIdx        - The ending index of the second subarray (exclusive).
 */
const combineSortedHalves = ( workingArray ,
                              startIdx     ,
                              middleIdx    ,
                              endIdx       ) => {

    // Calculate the sizes of the two halves.
    const firstHalfSize  =  middleIdx  -  startIdx ;
    const secondHalfSize =  endIdx     -  middleIdx;

    // Create temporary buffers for the left and right halves.
    const leftHalfBuffer  =  [ ] ;
    const rightHalfBuffer =  [ ] ;

    // Populate the left temporary buffer.
    for  ( let leftPtr = 0 ; leftPtr < firstHalfSize ; leftPtr++ )
    {
        leftHalfBuffer [ leftPtr ] = workingArray [ startIdx + leftPtr ] ;
    }

    // Populate the right temporary buffer.
    for  ( let rightPtr = 0 ; rightPtr < secondHalfSize ; rightPtr++ )
    {
        rightHalfBuffer [ rightPtr ] = workingArray [ middleIdx + rightPtr ] ;
    }

    // Add sentinel values (positive infinity) to the end of each buffer.
    // This simplifies the merging logic by avoiding boundary checks.
    leftHalfBuffer  [ firstHalfSize  ] = Infinity ;
    rightHalfBuffer [ secondHalfSize ] = Infinity ;

    // Initialize pointers for the temporary buffers.
    let leftPtr  =  0 ;
    let rightPtr =  0 ;

    // Merge the temporary buffers back into the original array.
    for  ( let currentIdx = startIdx ;
                currentIdx < endIdx  ;
                currentIdx++        )
    {
        // Increment the global comparison counter.
        comparisonCount++ ;

        // Compare elements from both buffers and place the smaller one
        // into the correct position in the main array.
        if  ( leftHalfBuffer [ leftPtr ] <= rightHalfBuffer [ rightPtr ] )
        {
            workingArray [ currentIdx ] = leftHalfBuffer [ leftPtr ] ;
            leftPtr ++ ;
        }
        else
        {
            workingArray [ currentIdx ] = rightHalfBuffer [ rightPtr ] ;
            rightPtr ++ ;
        }
    }
} ;

/**
 * Implements the merge sort algorithm to sort an array of numbers.
 * This function recursively divides the array and then merges the sorted halves.
 *
 * @param {Array<number>} workingArray - The array to be sorted.
 * @param {number}        startIdx     - The starting index of the subarray to sort.
 * @param {number}        endIdx       - The ending index of the subarray to sort (exclusive).
 */
const performMergeSort = ( workingArray ,
                           startIdx     ,
                           endIdx       ) => {

    // Base case: if the subarray has 0 or 1 element, it's already sorted.
    if  ( startIdx + 1 < endIdx )
    {
        // Calculate the middle point to divide the array.
        const middleIdx = Math.floor ( ( startIdx + endIdx ) / 2 ) ;

        // Recursively sort the left half.
        performMergeSort ( workingArray , startIdx  , middleIdx ) ;
        // Recursively sort the right half.
        performMergeSort ( workingArray , middleIdx , endIdx    ) ;

        // Merge the two sorted halves.
        combineSortedHalves ( workingArray , startIdx , middleIdx , endIdx ) ;
    }
} ;


// Parse the second line of input as a space-separated list of numbers.
const numericalData = inputLines [ 1 ] . split ( ' ' ) . map ( Number ) ;

// Execute the merge sort algorithm on the parsed numerical data.
performMergeSort ( numericalData ,
                   0             ,
                   numericalData . length ) ;

// Output the sorted numbers, joined by spaces.
console . log ( numericalData . join ( ' ' ) ) ;

// Output the total number of comparisons made during the sorting process.
console . log ( comparisonCount ) ;