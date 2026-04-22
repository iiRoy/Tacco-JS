/*
 * This JavaScript code snippet demonstrates a simple conditional logic
 * and a mathematical operation. It processes an input value, 'number',
 * and returns a computed result based on certain conditions.
 */


var    number     =     process  .   stdin   ;

    // Check if the input number is one of the special cases: 1, 2, or 0.
    if    (    number    ===    1    ||    number    ===    2    ||    number    ===    0    )
    {
            // If it's a special case, return 0 as per the logic.
            return    0    ;
    }

    // If not a special case, perform a division by 3 and floor the result.
    return     Math    .    floor    (    number    /    3    )    ;