'use strict'; // Enforce strict JavaScript rules for optimal performance.

/**
 *  This function processes a given string input to verify a specific character sequence pattern.
 *  It expects the input to contain at least one line with three space-separated segments.
 *
 *  @param {string} rawData The complete input string received, typically from standard input.
 */
let  processStringSequence  =  function ( rawData )  {

    //  First, we extract the relevant string segments from the input.
    //  The input is split by newline, taking only the first line, then that line is split by spaces.
    let  segmentCollection  =  rawData.split('\n')[0].split(' ');

    //  Assign each extracted segment to a distinct, descriptive variable.
    let  firstPart   =   segmentCollection[0];
    let  secondPart  =   segmentCollection[1];
    let  thirdPart   =   segmentCollection[2];

    //  Now, we evaluate the core conditions for the sequence.
    //  Condition 1: The very last character of the first segment must match the initial character of the second segment.
    //  Condition 2: The very last character of the second segment must match the initial character of the third segment.
    if  (  (firstPart.slice(-1)  ==  secondPart.slice(0, 1))  &&
           (secondPart.slice(-1) == thirdPart.slice(0, 1))    )
    {
        //  If both conditions hold true, output the positive confirmation.
        console.log('YES');
    }
    else
    {
        //  Otherwise, if any condition fails, output the negative response.
        console.log('NO');
    }

}; //  End of the string sequence processing function.

//  The program execution begins here:
//  Read the entire content from standard input using the 'fs' module,
//  decode it as UTF-8, and then pass it to our main processing function.
processStringSequence( require('fs').readFileSync('/dev/stdin', 'utf-8') );