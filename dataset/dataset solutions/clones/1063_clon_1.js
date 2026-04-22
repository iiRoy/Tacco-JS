/*
 * This file processes input from standard input,
 * performs a merge sort with inversion counting,
 * and then prints the total inversion count.
 *
 * It uses Node.js's 'fs' module to read the input.
 */
const line  =  require('fs') . readFileSync('/dev/stdin'  ,  'utf-8') . split('\n') ; // Read input from stdin, decode as UTF-8, and split by newline.


let cnt  =  0 ; // Global counter for inversions. Initialized to zero.


/**
 * Merges two sorted sub-arrays back into one,
 * while simultaneously counting inversions.
 *
 * @param {Array<number>} arr   The main array being sorted.
 * @param {number}        left  The starting index of the first sub-array.
 * @param {number}        mid   The dividing point (end of first, start of second).
 * @param {number}        right The ending index of the second sub-array.
 */
const merge  =  (  arr  ,  left  ,  mid  ,  right  )  =>  {

const   n1   =   mid   -   left  ; // Size of the left sub-array.
    const   n2   =   right   -   mid  ; // Size of the right sub-array.

    const   L   =   [ ]  ; // Temporary array for the left half.
    const   R   =   [ ]  ; // Temporary array for the right half.

    // Populate the left temporary array.
    for  ( let  i  =  0  ;  i  <  n1  ;  i++  )  {
        L[i]  =  arr[left  +  i] ;
    }

    // Populate the right temporary array.
    for  ( let  i  =  0  ;  i  <  n2  ;  i++  )  {
        R[i]  =  arr[mid  +  i] ;
    }

    // Add sentinels (infinity) to the end of both temporary arrays.
    // This simplifies the merge loop by avoiding explicit boundary checks.
    L[n1]  =  1/0 ;
    R[n2]  =  1/0 ;

    let   i   =   0 ; // Pointer for the left temporary array.
    let   j   =   0 ; // Pointer for the right temporary array.

    // Merge the temporary arrays back into the original array.
    for  ( let  k  =  left  ;  k  <  right  ;  k++  )  {
        if  ( L[i]  <=  R[j]  )  {
            arr[k]  =  L[i] ;
            i++ ;
        }  else  {
            arr[k]  =  R[j] ;
            j++ ;
            // If an element from R is taken, it means all remaining elements
            // in L (from current i to n1-1) are larger than R[j],
            // thus forming an inversion.
            cnt  +=  n1-i ;
        }
    }
} ;


/**
 * Implements the merge sort algorithm.
 * This is a recursive, divide-and-conquer sorting algorithm.
 *
 * @param {Array<number>} arr   The array to be sorted.
 * @param {number}        left  The starting index of the current sub-array.
 * @param {number}        right The ending index (exclusive) of the current sub-array.
 */
const msort  =  (  arr  ,  left  ,  right  )  =>  {

    // Base case: if the sub-array has 0 or 1 element, it's already sorted.
    if  ( left  +  1  <  right  )  {
        // Calculate the middle point to divide the array.
        const   mid   =   Math . floor(  (left  +  right)  /  2  ) ;

        // Recursively sort the left half.
        msort(arr  ,  left  ,  mid) ;

        // Recursively sort the right half.
        msort(arr  ,  mid  ,  right) ;

        // Merge the two sorted halves and count inversions.
        merge(arr  ,  left  ,  mid  ,  right) ;
    }
} ;


// The actual data to be sorted and analyzed for inversions.
// It's taken from the second line of the input (index 1),
// split by spaces, and each part converted to a number.
const data  =  line[1] . split(' ') . map(Number) ;

// Execute the merge sort on the data array to sort it
// and populate the global inversion count (cnt).
msort(data  ,  0  ,  data.length) ;

// Print the final count of inversions to standard output.
console . log(cnt) ;