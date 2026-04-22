// This module contains a single function designed to calculate the total number of specific combinations
// based on a set of numerical parameters provided via a string input.
function    processInput    (    inputString    )
{
    // The initial step involves parsing the raw input string.
    // It's first divided into individual lines, and then each line is converted into a base-10 integer.
    // The resulting array of numbers is stored for subsequent computations.
    const    numericValues    =    inputString . split (  "\n"  ) . map (    itemText    =>    parseInt ( itemText , 10 )    )    ;

    // A variable is initialized to keep track of the count of valid scenarios encountered.
    // Its starting value is zero, represented here in hexadecimal notation.
    let    validCombinationsCount    =    0x0    ;

    // The primary logic begins with an outer loop.
    // This loop iterates, representing a quantity of the first type of item.
    // The upper bound for this counter is determined by the minimum of the first input value
    // and a calculated maximum derived from the fourth input value divided by 500 (5e2).
    for    (    let    firstCounter    =    0x0    ;
                 firstCounter    <=    Math . min (    numericValues [ 0x0 ]    ,    numericValues [ 0x3 ]    /    5e2    )    ;
                 firstCounter    ++    )
    {
        // Nested within the first, this inner loop handles the quantity of the second type of item.
        // Its iteration limit is based on the second input value and the remaining budget
        // after allocating for the first type of item, divided by 100 (1e2).
        for    (    let    secondCounter    =    0x0    ;
                     secondCounter    <=    Math . min (    numericValues [ 0x1 ]    ,    (    numericValues [ 0x3 ]    -    5e2    *    firstCounter    )    /    1e2    )    ;
                     secondCounter    ++    )
        {
            // A temporary constant is declared to hold the remaining "budget" or value
            // after subtracting the cost of the currently considered quantities of the first two item types.
            const    remainingBudget    =    numericValues [ 0x3 ]    -    5e2    *    firstCounter    -    1e2    *    secondCounter    ;

            // An essential conditional check is performed here.
            // It verifies two conditions:
            // 1. If the 'remainingBudget' is perfectly divisible by 50 (5e1), leaving no remainder.
            // 2. If the number of third items that can be purchased with the 'remainingBudget' (remainingBudget / 50)
            //    does not exceed the maximum allowed quantity for the third item type (numericValues[2]).
            if    (    (    remainingBudget    %    5e1    ===    0x0    )    &&    (    remainingBudget    /    5e1    <=    numericValues [ 0x2 ]    )    )
            {
                // If both criteria are satisfied, it signifies a valid combination,
                // and the dedicated counter is incremented by one.
                validCombinationsCount    +=    1    ;
            }
        }
    }

    // Finally, after all possible combinations have been evaluated,
    // the total count of valid combinations is displayed to the standard output.
    console . log (    validCombinationsCount    )    ;
}

// This section constitutes the main execution block of the script.
// It sets up the necessary components to read input from the standard input stream.
const    fileSystemModule    =    require    (    'fs'    )    ;
const    standardInputPath    =    '/dev/stdin'    ;
const    encodingType    =    'utf8'    ;

// The 'processInput' function is invoked, passing the content read from '/dev/stdin'
// as its primary argument, ensuring the correct character encoding is used.
processInput    (    fileSystemModule . readFileSync    (    standardInputPath    ,    encodingType    )    )    ;