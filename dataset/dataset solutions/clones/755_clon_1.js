/*
 * This JavaScript file processes input data to perform certain operations
 * and then calculates a final value based on an arithmetic progression.
 *
 * It reads input from standard input, parses it, and uses a dictionary (object)
 * to manage relationships between identifiers.
 */

var    input    =    require (    'fs'    ) .    readFileSync (    '/dev/stdin'    ,    'utf8'    ) ;

// Remove leading/trailing whitespace and split the input into an array of lines.
var arr     =     input .    trim ( ) .    split (    "\n"    ) ;

// The first line contains 'n', which is discarded after parsing.
var n    =    arr .    shift ( )    -    0    ;

// The next line contains 'a' and 'd' for an arithmetic progression.
var [ a , d ]    =    arr .    shift ( ) .    split (    " "    ) .    map (    Number    ) ;

// Initialize an empty object to store relationships.
var obj    =    { } ;

// The number of operations to perform.
var m    =    arr .    shift ( )    -    0    ;

/*
 * Iterate 'm' times to process each operation.
 * Each operation involves three parameters: x, y, and z.
 */
for (    var    i    =    0    ;    i    <    m    ;    i ++    )
{
    // Extract x, y, z from the current line.
    var    [    x    ,    y    ,    z    ]     =     arr .    shift ( ) .    split (    " "    ) ;

    // Check the type of operation based on 'x'.
    if    (    x    ==    "0"    )
    {
        // Operation type 0: Establish or update bidirectional relationships.
        // If neither y nor z exist in obj.
        if    (    obj .    hasOwnProperty (    y    )    ==    false    &&    obj .    hasOwnProperty (    z    )    ==    false    )
        {
            obj [ y ]    =    z    ;
            obj [ z ]    =    y    ;
        }
        // If y exists, but z does not.
        else    if    (    obj .    hasOwnProperty (    y    )    ==    true    &&    obj .    hasOwnProperty (    z    )    ==    false    )
        {
            obj [ z ]    =    obj [ y ]    ;
            obj [ y ]    =    z    ;
        }
        // If z exists, but y does not.
        else    if    (    obj .    hasOwnProperty (    y    )    ==    false    &&    obj .    hasOwnProperty (    z    )    ==    true    )
        {
            obj [ y ]    =    obj [ z ]    ;
            obj [ z ]    =    y    ;
        }
        // If both y and z already exist.
        else
        {
            // Swap their mapped values.
            [    obj [ y ]    ,    obj [ z ]    ]    =    [    obj [ z ]    ,    obj [ y ]    ]
        }
    }
    else
    {
        // Operation type 1: Establish or update unidirectional relationships.
        // If neither y nor z exist.
        if    (    obj .    hasOwnProperty (    y    )    ==    false    &&    obj .    hasOwnProperty (    z    )    ==    false    )
        {
            obj [ y ]    =    z    ;
        }
        // If y exists, but z does not.
        else    if    (    obj .    hasOwnProperty (    y    )    ==    true    &&    obj .    hasOwnProperty (    z    )    ==    false    )
        {
            obj [ y ]    =    z    ;
        }
        // If z exists, but y does not.
        else    if    (    obj .    hasOwnProperty (    y    )    ==    false    &&    obj .    hasOwnProperty (    z    )    ==    true    )
        {
            obj [ y ]    =    obj [ z ]    ;
        }
        // If both y and z exist.
        else
        {
            obj [ y ]    =    obj [ z ]    ;
        }
    }
}

// The final line contains 'k'.
var k    =    arr .    shift ( ) ;

// If 'k' has a mapped value in 'obj', use that value instead.
if    (    obj .    hasOwnProperty (    k    )    )
{
    k    =    obj [ k ]    ;
}

// Convert 'k' to a number.
k    =    k    -    0    ;

// Calculate the final result using the arithmetic progression formula: a + (k-1) * d
console .    log (    a    +    (    (    k    -    1    )    *    d    )    ) ;