/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered.
 */

// Importing the 'fs' module to read file content.
const    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;


/*
 * Helper function to check if an element 'a' exists within an array 'arr'.
 * Returns true if found, false otherwise.
 */
const    includes    =    (    arr    ,    a    )    =>    {
    if    (    arr . indexOf ( a )    >=    0    )    {
        return    true    ;    // Element is present in the array.
    }    else    {
        return    false    ;    // Element is not found.
    }
}    ;


// Splitting the input string into lines.
const    list1    =    input . split ( '\n' ) [ 0 ]    ;    // The first line of input.
const    list2    =    input . split ( '\n' ) [ 1 ]    ;    // The second line of input.


// Parsing 'n' and 'm' from the first line.
const    n    =    Number ( list1 . split ( ' ' ) [ 0 ] )    ;    // First number on list1.
const    m    =    Number ( list1 . split ( ' ' ) [ 1 ] )    ;    // Second number on list1.


// Processing the second line of input.
const    numberlist    =    list2 . split ( ' ' ) . map (    i    =>    Number ( i )    )    ;    // Converts space-separated strings to numbers.


// Sorting the numerical list in ascending order.
const    sorted    =    numberlist . sort (    ( a , b )    =>    a    -    b    )    ;


// Declaring a variable to store differences between consecutive sorted numbers.
var    minuslist    =    [ ]    ;


// Loop to calculate the differences between adjacent elements in the sorted list.
for    (    var    i    =    0    ;    i    <    m    -    1    ;    i ++    )    {
    minuslist . push ( sorted [ i + 1 ]    -    sorted [ i ] )    ;    // Stores m-1 differences.
}


// Sorting the list of differences in ascending order.
const    sortedminus    =    minuslist . sort (    ( a , b )    =>    a    -    b    )    ;


// Slicing the sorted differences to get a specific sub-array.
const    maxarr    =    sortedminus . slice ( m    -    n )    ;


// Conditional block to calculate the final answer.
if    (    maxarr . length    !==    0    )    {
    // If 'maxarr' is not empty, calculate its sum.
    var    maxarrsum    =    maxarr . reduce (    ( p , c )    =>    {
        return    p    +    c    ;
    }    )

    // Calculate the answer based on max/min of numberlist and the sum of maxarr.
    var    answer    =    Math . max . apply ( null ,    numberlist )    -    Math . min . apply ( null ,    numberlist )    -    maxarrsum    ;
}    else    {
    // If 'maxarr' is empty, the answer defaults to 0.
    var    answer    =    0    ;
}


// Function to handle the output logic.
const    output    =    ( )    =>    {
    // If 'n' is greater than or equal to 'm', print 0.
    if    (    n    >=    m    )    {
        console . log ( 0 )    ;
        return    ;
    }
    // Otherwise, print the calculated 'answer'.
    console . log ( answer )    ;
    return    ;
}


// Invoke the output function to display the result.
output ( )    ;