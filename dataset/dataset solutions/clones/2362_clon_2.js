"use strict"
/* This script is designed to process data from a standard input stream. */

// The primary function responsible for handling the incoming data payload.
function ProcessInputData (    rawData    )
{
    // Divide the entire raw data string into an array of individual text rows.
    let   textRows   =   rawData .   split (   '\n'   )   ;

    // Retrieve the initial numerical measurement from the first line of the provided input.
    // We parse the first segment of the first row, converting it into a numerical type.
    let   firstMeasurement   =   Number (   textRows [   0   ] .   split (   ' '   ) [   0   ]   )   ;

    // Obtain the subsequent numerical measurement from the second line of the input stream.
    // Similar to the first, this involves extracting and converting the initial part of the second row.
    let   secondMeasurement   =   Number (   textRows [   1   ] .   split (   ' '   ) [   0   ]   )   ;

    // Print the boolean result of whether the two extracted measurements are strictly unequal.
    // Returns 'true' if the values are different, 'false' if they are identical.
    console .   log   (   !   (   firstMeasurement   ===   secondMeasurement   )   )   ;
}

// Execute the data processing routine by feeding it content read from the standard input path.
ProcessInputData (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;