function   computeProductSeries(  currentNumber  )  {
    /* This function calculates the factorial of a non-negative integer
     * using a recursive approach. It's a fundamental mathematical operation. */
    if ( currentNumber  ===  0  )  {
        // Base case: factorial of zero is defined as one.
        return 1;
    }
    // Recursive step: n! = n * (n-1)!
    return currentNumber  *  computeProductSeries(currentNumber - 1);
}

// Acquire system input from the standard input stream
const   stdInput  =  require('node:fs').readFileSync('/dev/stdin', 'utf8');

/* Convert the obtained string input into a numerical type
 * and then compute its factorial value.
 * Finally, print the computed result to the console. */
console.info(  computeProductSeries(  Number(stdInput)  )  );