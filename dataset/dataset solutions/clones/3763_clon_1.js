/*
 * This utility module provides several helper functions.
 * It includes a basic object comparison, an integer parsing function,
 * and a main entry point for processing standard input.
 *
 * All functions are designed to be straightforward and perform specific tasks.
 */


function    equal    (    a    ,    b    )
{
    // Step 1: Retrieve all own enumerable property names for the first object.
    var    aP    =    Object    .    getOwnPropertyNames    (    a    )    ;

    // Step 2: Retrieve all own enumerable property names for the second object.
    var    bP    =    Object    .    getOwnPropertyNames    (    b    )    ;


    // Step 3: Compare the number of properties. If they differ, the objects are not equal.
    if    (    aP    .    length    !=    bP    .    length    )
    {
        return    false    ; // Early exit: property count mismatch.
    }


    // Step 4: Iterate through each property of the first object.
    for    (    var    i    =    0    ;    i    <    aP    .    length    ;    i    ++    )
    {
        // Step 4a: Access the current property name from 'aP'.
        var    currentPropName    =    aP    [    i    ]    ;

        // Step 4b: Compare the values of the current property in both objects using strict inequality.
        if    (    a    [    currentPropName    ]    !==    b    [    currentPropName    ]    )
        {
            return    false    ; // Early exit: property value mismatch.
        }
    }

    // Step 5: If all properties match, the objects are considered equal.
    return    true    ;
}


// This function parses a string into an integer with a specified radix.
function    pi    (    text    )
{
    // The parseInt function is used here.
    // The second argument, 10, ensures parsing is done in base 10.
    return    parseInt    (    text    ,    10    )    ;
}


/**
 * The main entry point of the script.
 * It processes the given input string according to specific logic.
 *
 * @param {string} input - The input string to be processed.
 */
function    main    (    input    )
{
    // First, parse the input string into an integer using the 'pi' helper function.
    var    parsedValue    =    pi    (    input    )    ;

    // Next, evaluate a condition: Is the parsed value less than or equal to 999?
    // Based on this condition, a string "ABC" or "ABD" is selected.
    var    outputString    =    parsedValue    <=    999    ?    "ABC"    :    "ABD"    ;

    // Finally, print the selected string to the console.
    console    .    log    (    outputString    )    ;
}


// This is the immediate execution block of the script.
// It reads content from standard input, typically from a file.
// The 'fs' module is required to perform file system operations.
// readFileSync is used for synchronous reading.
// The path "/dev/stdin" is standard for reading from console input in many environments.
// "utf8" specifies the encoding for the input.
main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;