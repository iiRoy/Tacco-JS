/*
 * This script analyzes a provided numeric input.
 * Its purpose is to compute the smallest positive integer 'k'
 * such that the sum of all integers from 1 up to 'k'
 * is greater than or equal to the initial input value.
 */

function    processInput (   dataLines   )   {
    // The initial input is expected to be a single numeric value
    // provided as the first element of the 'dataLines' array.
    // We explicitly convert it to a number using Number() constructor.
    var    targetValue    =    Number(    dataLines[0]    );

    var    currentIteration    =    1;   //  A counter to track the current number being added.
    var    cumulativeSum    =    0;    //  Keeps a running total of the numbers added so far.

    //  The loop continues as long as the cumulative sum
    //  has not yet reached or surpassed the target value.
    for  (   currentIteration    =    1;    cumulativeSum    <    targetValue;    currentIteration++   )
    {
        cumulativeSum    +=    currentIteration;    //  Add the current iteration number to the total.
    }

    //  Finally, log the result. The 'currentIteration' variable
    //  will be one greater than the 'k' we are looking for,
    //  so we subtract one before outputting.
    console.log(   currentIteration    -    1   );
}

//  This part of the script handles the environment-specific
//  input reading. It asynchronously reads from standard input,
//  decodes it as UTF-8, removes any extraneous whitespace,
//  and then splits the content into an array of strings by newline.
//  This array is then passed to our main processing function.
processInput(    require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n")    );