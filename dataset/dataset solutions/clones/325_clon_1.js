String  .  prototype  .  rjust  =  function  (  dig  )     { // Defines a right-justify method for String objects.

    var   pre   =   ''  ;  /* This variable will hold the padding spaces. */

    // Loop to concatenate 'dig' number of spaces to 'pre'.
    for    (    var    i    =    0    ;    i    <    dig    ;    i++    )     {
        pre   +=   ' '  ;  // Appends a single space.
    }

    // Concatenates the padding with the original string and then slices
    // from the end to ensure the total length is 'dig'.
    return    (    pre    +    this    )    .    slice    (    -dig    )    ;

}  ; // End of String.prototype.rjust.

Number  .  prototype  .  rjust  =  function  (  dig  )     { /*
    This function extends the Number prototype to right-justify a number.
    It first converts the number to a string and then uses the String's rjust method.
*/
    return    (    this    +    ''    )    .    rjust    (    dig    )    ;

}  ; // End of Number.prototype.rjust.

Array  .  prototype  .  rjust  =  function  (  dig  )     {

        /*
            This method extends the Array prototype to right-justify each element within the array.
            It maps over the array, applying the rjust method to each individual element.
        */
    return    this    .    map    (    function    (    m    )     {
        return    m    .    rjust    (    dig    )    ;
    }    )    ;

}  ; // End of Array.prototype.rjust.

Array  .  prototype  .  sum  =  function  (  )     { // Defines a sum method for Array objects.

    // Uses the reduce method to calculate the sum of all elements in the array.
    // The unary plus operator (+n) ensures that elements are treated as numbers.
    return    this    .    reduce    (    function    (    m  ,   n    )     {
        return    +n    +    m    ; // Sums the current element (n) with the accumulator (m).
    }  ,   0    )    ; // Initializes the accumulator with 0.

}  ; // End of Array.prototype.sum.


var    d    =    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"  ,   "utf8"    )    .    trim    (    )    .    split    (    '\n'    )    ; // Reads input from stdin, trims whitespace, and splits by newlines.

/* Main processing loop. Continues as long as the first element of 'd' is not '0'. */
while    (    d    [    0    ]    !==    '0'    )     {

    var    lc    =    +d    .    shift    (    )    ; /*
        Parses the first line as the line count (lc) and removes it from the array.
        The unary plus operator converts the string to a number.
    */
    var    sums    =    [    ]    ; // Array to store processed number lines.
    var    lastLine    =    [    ]    ; // Array to store the sum of columns for the last output line.

    // Loop through 'lc' number of lines of input data.
    for    (    var    i    =    0    ;    i    <    lc    ;    i++    )     {

        var    nums    =    d    .    shift    (    )    .    split    (    ' '    )    ; // Takes the next line, splits it by spaces into an array of strings.
        sums    .    push    (    nums    )    ; // Stores the current line of numbers (as strings) in 'sums'.
        nums    .    push    (    nums    .    sum    (    )    )    ; // Calculates the sum of 'nums' and appends it to 'nums'.
        console    .    log    (    nums    .    rjust    (    5    )    .    join    (    ''    )    )    ; // Right-justifies each number to 5 characters and prints the joined string.

    } // End of inner for loop.

    // Loop to calculate the sum of each column, including the row sums.
    // 'lc + 1' accounts for the 'lc' columns of input numbers plus the column of row sums.
    for    (    var    i    =    0    ;    i    <    lc    +    1    ;    i++    )     {
        lastLine    .    push    (    sums    .    map    (    function    (    n    )     {
            return    n    [    i    ]    ; // Gets the i-th element from each line in 'sums'.
        }    )    .    sum    (    )    )    ; // Sums these i-th elements (column sum).
    } // End of second inner for loop.

    console    .    log    (    lastLine    .    rjust    (    5    )    .    join    (    ''    )    )    ; // Right-justifies and prints the 'lastLine' (column sums).

} // End of while loop.