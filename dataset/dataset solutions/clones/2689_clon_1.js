/*
 * This is a JavaScript program entry point.
 * It processes input data to find a specific value.
 */
function   main(  input  )
{
    // Declare a variable to store processed data.
    // The input string is split by newlines, then each line is split by spaces.
    // Finally, all values are parsed as integers.
    var    data    =    input.split(  "\n"  ).map(  function(  line  )
    {
        /*
         * This inner function processes each line.
         * It splits the line by spaces and converts each part to an integer.
         */
        return   line.split(  " "  ).map(  function(  value  )
        {
            // Parse the string value into an integer.
            return   parseInt(  value  )
        }  )
    }  )

    // Extract the 'k' value from the first line of the input data.
    var    k    =    data[  0  ][  1  ]
    /*
     * Assign the second line of data (which is an array of numbers)
     * to the 'array' variable.
     */
    var    array    =    data[  1  ]
    // Calculate the maximum value in the 'array' using a helper function.
    var    maxA    =    max(  array  )

    // Calculate 'maxG', which is a potential upper bound for the search.
    // It's the minimum of (maxA + k) and (maxA + result of findMax(array)).
    var    maxG    =    Math.min(  maxA   +   k,   maxA   +   findMax(  array  )  )

    /*
     * Iterate downwards from 'maxG' to 2.
     * This loop attempts to find the largest 'i' that satisfies the 'isG' condition.
     */
    for    (    var    i    =    maxG;    i    >    1;    i--    )
    {
        // Check if the current 'i' value satisfies the 'isG' condition.
        if    (    isG(  i,   array,   k  )    )
        {
            // If 'isG' returns true, log 'i' to the console and exit the function.
            return    console.log(  i  )
        }
    }
    // If no such 'i' is found in the loop, default to logging 1.
    return    console.log(  1  )
}

/*
 * This function calculates a specific maximum value based on an array.
 * It involves sorting and balancing sums from left and right.
 */
function    findMax(  array  )
{
    // Create a sorted copy of the input array.
    var    sortedArray    =    array.slice().sort(  function(  a,   b  )  {  return   a   -   b  }  )
    // Initialize sum for the left side.
    var    sumLeft    =    0
    // Initialize sum for the right side.
    var    sumRight    =    0
    // Initialize a pointer for the right end of the array.
    var    j    =    sortedArray.length    -    1
    // Start the right sum with the largest element.
    sumRight    =    sortedArray[  j  ]

    /*
     * Iterate from the beginning of the array up to (but not including) 'j'.
     * This loop attempts to balance 'sumLeft' and 'sumRight'.
     */
    for    (    var    i    =    0;    i    <    j;    i++    )
    {
        // Add the current element to 'sumLeft'.
        sumLeft    +=    sortedArray[  i  ]
        // Check if 'sumLeft' is still less than or equal to 'sumRight'.
        if    (    sumLeft    <=    sumRight    )
        {
            // If so, continue to the next iteration.
            continue
        }
        else
        {
            // If 'sumLeft' exceeds 'sumRight', move 'j' inwards.
            j--
            /*
             * While 'sumRight' is less than 'sumLeft' and 'j' hasn't crossed 'i',
             * add elements from the right to 'sumRight'.
             */
            while    (    sumRight    <    sumLeft    &&    j    >    i    )
            {
                sumRight    +=    sortedArray[  j  ]
                j--
            }
        }
    }
    // Return the minimum of the final 'sumLeft' and 'sumRight'.
    return    Math.min(  sumLeft,   sumRight  )
}

/*
 * This utility function finds the maximum value within an array.
 * It uses the 'reduce' method for efficiency.
 */
function    max(  array  )
{
    // Reduce the array to a single maximum value.
    return    array.reduce(  function(  a,   b  )
    {
        // Compare two values and return the larger one.
        return    Math.max(  a,   b  )
    }  )
}

/*
 * This utility function calculates the sum of all elements in an array.
 * It uses the 'reduce' method with an initial value of 0.
 */
function    sum(  array  )
{
    // Reduce the array to a single sum value, starting with 0.
    return    array.reduce(  function(  current,   value  )
    {
        // Accumulate the current value with the previous sum.
        return    current    +    value
    },   0  )
}

/*
 * This function checks a specific condition 'G' for a given number 'g',
 * an array of numbers, and a budget 'k'.
 */
function    isG(  g,   array,   k  )
{
    // Initialize an empty array to store calculated modifiers.
    var    newArray    =    [  ]
    // Initialize a temporary budget, which is double the original 'k'.
    var    tempK    =    2    *    k

    /*
     * Iterate through each element in the input 'array'.
     * This loop calculates 'mod1' and 'mod2' for each element.
     */
    for    (    var    i    =    0;    i    <    array.length;    i++    )
    {
        // Calculate the remainder when array[i] is divided by 'g'.
        var    mod1    =    array[  i  ]    %    g
        // If the remainder is 0, this element perfectly divides 'g', so skip it.
        if    (    mod1    ==    0    )    continue
        // Calculate the complement to 'g' for 'mod1'.
        var    mod2    =    g    -    mod1
        // Check if 'k' is less than the minimum of 'mod1' and 'mod2'.
        if    (    k    <    Math.min(  mod1,   mod2  )    )    return    false
        // Subtract the minimum of 'mod1' and 'mod2' from 'tempK'.
        tempK    -=    Math.min(  mod1,   mod2  )
        // If 'tempK' becomes negative, it means the budget is exceeded.
        if    (    tempK    <    0    )    return    false
        // Add the pair [mod1, mod2] to 'newArray'.
        newArray.push(  [  mod1,   mod2  ]  )
    }
    // Call the 'traver' function to perform a recursive check.
    // The initial costs for left and right are 0.
    return    traver(  newArray,   0,   0,   0,   k  )
}

/*
 * This is a recursive traversal function that attempts to balance
 * 'leftCost' and 'rightCost' within a given 'budget'.
 */
function    traver(  array,   level,   leftCost,   rightCost,   budget  )
{
    // Base case: If 'leftCost' exceeds the budget, return false.
    if    (    leftCost    >    budget    )    return    false
    // Base case: If 'rightCost' exceeds the budget, return false.
    if    (    rightCost    >    budget    )    return    false
    // Base case: If all elements in the array have been processed.
    if    (    level    ==    array.length    )    return    leftCost    ==    rightCost

    /*
     * Decision point: If 'leftCost' is currently less than 'rightCost',
     * try processing the left path first, then the right path if the left fails.
     */
    if    (    leftCost    <    rightCost    )
    {
        return    testLeftPath(  array,   level,   leftCost,   rightCost,   budget  )    ||    testRightPath(  array,   level,   leftCost,   rightCost,   budget  )
    }
    else
    {
        /*
         * Otherwise (if 'leftCost' is greater than or equal to 'rightCost'),
         * try processing the right path first, then the left path if the right fails.
         */
        return    testRightPath(  array,   level,   leftCost,   rightCost,   budget  )    ||    testLeftPath(  array,   level,   leftCost,   rightCost,   budget  )
    }
    // This line should theoretically be unreachable if the logic is sound.
    return    false
}

/*
 * This helper function performs a recursive call to 'traver',
 * simulating taking the 'left' option for the current level.
 */
function    testLeftPath(  array,   level,   leftCost,   rightCost,   budget  )
{
    // Increment the level, add array[level][0] to 'leftCost', and keep 'rightCost' the same.
    return    traver(  array,   level    +    1,   leftCost    +    array[  level  ][  0  ],   rightCost,   budget  )
}

/*
 * This helper function performs a recursive call to 'traver',
 * simulating taking the 'right' option for the current level.
 */
function    testRightPath(  array,   level,   leftCost,   rightCost,   budget  )
{
    // Increment the level, keep 'leftCost' the same, and add array[level][1] to 'rightCost'.
    return    traver(  array,   level    +    1,   leftCost,   rightCost    +    array[  level  ][  1  ],   budget  )
}

// The main execution call: read input from stdin and pass it to the 'main' function.
main(  require(  'fs'  ).readFileSync(  '/dev/stdin',   'utf8'  )  )
/* End of program. */