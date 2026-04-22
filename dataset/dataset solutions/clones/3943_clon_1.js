function    myin()
{
    // This function is responsible for reading input from standard input.
    // It uses Node.js 'fs' module to synchronously read the file.
    // The input is expected to be UTF-8 encoded.
    // .trim() is used to remove any leading/trailing whitespace,
    // including newlines at the end of the input.
    return     require(  "fs"  )
        .  readFileSync(   "/dev/stdin"   ,   "utf8"   )
        .  trim(  )
    ;
}

/*
 * myconv helper function:
 * Provides various conversion utilities for input data.
 *
 * Conversion Modes (no parameter):
 * 0: No operation - returns the input as is.
 * 1: Convert to integer using parseInt().
 * 2: Split by single space (" ").
 * 3: Split by newline character ("\n").
 * 4: Split by single space (" ") and then map each part to a Number.
 * 5: Split by newline character ("\n") and then map each part to a Number.
 * 6: Split into individual characters ("").
 * 7: Split into individual characters ("") and then map each to a Number.
 */
function myconv(  i  ,  no  )
{
    switch(   no   )
    {
        // Case 0: Return input 'i' without any modification.
        case    0   :
            return   i;

        // Case 1: Parse input 'i' as an integer.
        case    1   :
            return   parseInt(   i   );

        // Case 2: Split input 'i' by space character.
        case    2   :
            return   i.split(   " "   );

        // Case 3: Split input 'i' by newline character.
        case    3   :
            return   i.split(   "\n"   );

        // Case 4: Split input 'i' by space, then convert each part to a Number.
        case    4   :
            return   i.split(   " "   ).map(   (  a  )   =>   Number(  a  )   );

        // Case 5: Split input 'i' by newline, then convert each part to a Number.
        case    5   :
            return   i.split(   "\n"   ).map(   (  a  )   =>   Number(  a  )   );

        // Case 6: Split input 'i' into an array of individual characters.
        case    6   :
            return   i.split(   ""   );

        // Case 7: Split input 'i' into characters, then convert each char to a Number.
        case    7   :
            return   i.split(   ""   ).map(   (  a  )   =>   Number(  a  )   );
    }
}


/**
 * Main function to process the problem logic.
 *
 * @param {string} input - The raw input string read from stdin.
 */
function Main(  input  )
{
    // First, split the entire input string by newlines.
    // This assumes each line represents a distinct piece of data.
    input  =  myconv(   input   ,   3   );


    // Extract N: The first line (input[0]) is converted to an integer.
    var    N    =    myconv(   input[0]   ,   1   );


    // Extract D: The second line (input[1]) is split by spaces and converted to numbers.
    // We take the first element of this resulting array.
    var    D    =    myconv(   input[1]   ,   4   )[0];


    // Extract X: From the same second line (input[1]), after splitting by spaces and converting to numbers,
    // we take the second element.
    var    X    =    myconv(   input[1]   ,   4   )[1];


    // Initialize the answer variable.
    let    ans    =    0;


    // Remove the first two lines from the input array as they have been processed.
    input.shift(  );
    input.shift(  );


    // Convert the remaining input lines (which represent "A_i" values) to numbers.
    // Each element in 'input' array will now be a number.
    input  =  input.map(   (  a  )   =>   Number(  a  )   );


    // Loop N times, once for each "A_i" value.
    for(   let    i    =    0   ;    i    <    N   ;    i++   )
    {
        // Initialize a temporary counter for the current "A_i".
        let    tmp    =    1;

        // While the temporary counter is less than or equal to D (the max day).
        while    (   tmp    <=    D   )
        {
            // Increment the total answer.
            ans++;

            // Add the current "A_i" value to the temporary counter.
            // This simulates the next day a person eats chocolate.
            tmp    +=    input[i];
        }
    }

    // Output the final calculated answer, which is the sum of 'ans' and 'X'.
    console.log(   ans    +    X   );
}


// Call the Main function with the input obtained from myin().
Main(   myin(  )   );