const   fileAccessUtility   =   require   (   'fs'   )   ;   // Import the Node.js file system module.

// Read the complete content from the standard input stream, interpreting it as UTF-8 text.
// Then, divide the entire string into an array of individual lines.
const   contentLines      =   fileAccessUtility   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   split   (   '\n'   )   ;

// Extract the total quantity of data points from the first line of input.
const   elementQuantity   =   Number   (   contentLines   [   0   ]   )   ;

// Process the second line of input:
// 1. Split the string by spaces to get an array of string representations of numbers.
// 2. Transform each string value into its numeric equivalent.
//    (Note: The original map function was missing a 'return' statement, which would result in an array of 'undefined'.
//     This corrected version ensures proper numeric conversion using the unary plus operator.)
const   numericDataPoints   =   contentLines   [   1   ]
                                .   split   (   ' '   )
                                .   map   (   (   stringValue   )   =>   +stringValue   )   ;

// Initialize a tracker for the smallest absolute difference encountered.
// It's set to null initially, as no differences have been calculated yet.
let   smallestAbsoluteDelta   =   null   ;

// Begin an iterative process to evaluate different splitting points within the numeric data.
// The loop starts from the second element (index 1) up to, but not including, the last element.
for   (   let   partitionIndex   =   1   ;   partitionIndex   <   elementQuantity   ;   partitionIndex   ++   )   {

    // Calculate the summation of values in the first segment of the array,
    // from the beginning up to the current partition index.
    const   firstSegmentSum   =   numericDataPoints
                                    .   slice   (   0   ,   partitionIndex   )
                                    .   reduce   (   (   runningTotal   ,   currentValue   )   =>   runningTotal   +   currentValue   ,   0   )   ;

    // Calculate the summation of values in the second segment of the array,
    // starting from the current partition index to the end.
    const   secondSegmentSum  =   numericDataPoints
                                    .   slice   (   partitionIndex   )
                                    .   reduce   (   (   runningTotal   ,   currentValue   )   =>   runningTotal   +   currentValue   ,   0   )   ;

    // Compute the raw difference between the two segment sums.
    let   currentCalculatedDifference   =   firstSegmentSum   -   secondSegmentSum   ;

    // Convert the calculated difference into its absolute value if it's negative.
    if   (   currentCalculatedDifference   <   0   )   {
            currentCalculatedDifference   =   -currentCalculatedDifference   ;
    }

    // Compare the current absolute difference with the smallest one found so far.
    // Update the smallestAbsoluteDelta if this is the first difference, or if the current one is smaller.
    if   (   smallestAbsoluteDelta   ===   null   ||   smallestAbsoluteDelta   >   currentCalculatedDifference   )   {
            smallestAbsoluteDelta   =   currentCalculatedDifference   ;
    }
}

// Output the final determined minimum absolute difference to the console.
console   .   log   (   smallestAbsoluteDelta   )   ;