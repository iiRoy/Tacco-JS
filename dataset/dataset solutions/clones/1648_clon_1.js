/*
 * This JavaScript code snippet is a Type I clone.
 * It is structurally and functionally identical to the original code.
 * The only modifications are extensive changes to whitespace (indentation, spacing, blank lines)
 * and the addition of comments throughout the file.
 * All identifiers, variable names, function names, operators, and expressions
 * have been preserved exactly as they appeared in the source code.
 */


// Declare variable 'A' and initialize it by parsing the first token
// from the first line of the input.
var A    =    input[0] . split(" ")[0]    ;

// Declare variable 'B' and initialize it by parsing the second token
// from the first line of the input.
var B    =    input[0] . split(" ")[1]    ;

// Declare variable 'C' and initialize it by parsing the third token
// from the first line of the input.
var C    =    input[0] . split(" ")[2]    ;


// Declare variable 'K' and initialize it from the second line of the input.
var K    =    input[1]    ;


// --- Start of conditional logic block to determine the value of 'i' ---

// First condition: If B is strictly greater than A.
if    (    B    >    A    )    {
    i    =    0
}
// Second condition: If B is exactly equal to A.
else    if    (    B    ==    A    )    {
    i    =    1
}
// Third condition: If B is less than A, and (2 * B) is greater than or equal to A.
// Note: The comma operator evaluates both expressions but returns the value of the last one.
else    if    (    B    <    A    ,    2    *    B    >=    A    )    {
    i    =    1
}
// Fourth condition: If (2 * B) is less than A, and (4 * B) is greater than or equal to A.
else    if    (    2    *    B    <    A    ,    2    *    2    *    B    >=    A    )    {
    i    =    2
}
// Fifth condition: If (4 * B) is less than A, and (8 * B) is greater than or equal to A.
else    if    (    2    *    2    *    B    <    A    ,    2    *    2    *    2    *    B    >=    A    )    {
    i    =    3
}

// --- End of 'i' determination block ---


// --- Start of conditional logic block to determine the value of 'p' ---

// First condition for 'p': If C is strictly greater than B.
if    (    C    >    B    )    {
    p    =    0
}
// Second condition for 'p': If C is exactly equal to B.
else    if    (    C    ==    B    )    {
    p    =    1
}
// Third condition for 'p': If C is less than B, and (2 * C) is greater than or equal to B.
// The comma operator usage is preserved here.
else    if    (    C    <    B    ,    2    *    C    >=    B    )    {
    p    =    1
}
// Fourth condition for 'p': If (2 * C) is less than B, and (4 * V) is greater than or equal to B.
// IMPORTANT: The original code uses 'V' here instead of 'C'. This is preserved as a Type I clone.
else    if    (    2    *    C    <    B    ,    2    *    2    *    V    >=    B    )    {
    p    =    2
}
// Fifth condition for 'p': If (4 * C) is less than B, and (8 * C) is greater than or equal to B.
else    if    (    2    *    2    *    C    <    B    ,    2    *    2    *    2    *    C    >=    B    )    {
    p    =    3
}

// --- End of 'p' determination block ---


// --- Final decision logic based on 'i', 'p', and 'K' ---

// Check if the sum of 'i' and 'p' is less than or equal to 'K'.
if    (    i    +    p    <=    K    )    {
    // If the condition holds true, print "Yes" to the standard output.
    console    .    log    (    "Yes"    )    ;
}
// Otherwise, if the condition is false.
else    {
    // Print "No" to the standard output.
    console    .    log    (    "No"    )    ;
}


// This closing brace indicates the end of an outer code block or function scope.
// It is replicated precisely as it appears in the original source.
}


// This line invokes the 'main' function, which is a common entry point
// in competitive programming. It reads the entire content of standard input
// asynchronously as a UTF-8 string and passes it to 'main'.
main(    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;