var       input =   require ( 'fs' )  .   readFileSync (   '/dev/stdin'  ,   'utf8'   )  .   trim (   )  .   split (   '\n'   )   ;

// The variable 'n' is parsed from the first line of input.
// Although read, it is not used in the subsequent sorting logic in this particular snippet.
var       n   =   parseInt (   input   .   shift (   )  ,   10   )   ;

/*
 *  The 'nums' array is initialized by taking the second line of input,
 *  splitting it by spaces, and converting each resulting string to a Number.
 */
var       nums    =   input   .   shift (   )  .   split (   ' '   )  .   map (   Number   )   ;


// This loop implements a variation of the insertion sort algorithm.
// It iterates through the array, inserting each element into its correct position
// within the already sorted part of the array.
for (   var   i   =   0   ;   i   <   nums   .   length   ;   i   +=   1   )   {
    // 'v' stores the current element that needs to be inserted.
    var       v   =   nums   [   i   ]   ;
    // 'j' is used as an index to traverse the sorted portion of the array backwards.
    var       j   =   i   -   1   ;

    // This inner loop shifts elements of the sorted subarray (nums[0...j])
    // to the right if they are greater than 'v', making space for 'v'.
    while (   j   >=   0   &&   nums   [   j   ]   >   v   )   {
        // Shift the element at 'j' to the position 'j + 1'.
        nums   [   j   +   1   ]   =   nums   [   j   ]   ;
        // Decrement 'j' to check the next element to the left.
        j   -=   1   ;
    }

    // After the while loop, 'j + 1' is the correct position for 'v'.
    nums   [   j   +   1   ]   =   v   ;

    // Print the current state of the array after each insertion step.
    // Elements are joined by a single space.
    console   .   log (   nums   .   join (   ' '   )   )   ;
}
/*
 *  End of the JavaScript program.
 *  The 'nums' array will be fully sorted in ascending order upon completion.
 */