/* This script utilizes the Node.js file system module for input operations */
fileSysMod = require('fs');

// Read all content from standard input, specified as '/dev/stdin', using UTF-8 encoding
rawInputContent = fileSysMod.readFileSync('/dev/fd/0', 'utf-8');

/*
 * Divide the entire raw input string into an array of strings,
 * using the newline character as a delimiter.
 * This assumes the input contains multiple lines.
 */
inputLineArray = rawInputContent.split('\n');


// Parse the first numerical value from the first line of input.
// The first line is expected to contain space-separated integers.
desiredNumber = parseInt(inputLineArray[0].split(' ')[0], 0xA);

// Parse the second numerical value from the first line, representing the count of forbidden numbers.
numForbidden = parseInt( inputLineArray[0].split(' ')[1], 10 );


// Check for a special case: if no numbers are forbidden.
if ( numForbidden === 0x0 )
{
    console.log( desiredNumber ); // Output the initially desired number.
    return;                     // Terminate the script execution early.
}


// The second line of input is expected to contain space-separated forbidden numbers as strings.
prohibitedNumbersStr = inputLineArray[1].split(' ');


// Initialize a variable to hold the closest allowed number found.
// It will be updated during the search process.
resultantClosest = 0;

/*
 * Begin a search loop from a high numerical bound down to a low numerical bound.
 * This range is defined to cover potential solutions.
 */
for ( currentNumCheck = 100; currentNumCheck >= -0xA; currentNumCheck-- )
{
    // Assume the current number under inspection is allowed by default.
    isAllowed = !false;

    /*
     * Inner loop: iterate through the list of forbidden numbers
     * to determine if currentNumCheck is prohibited.
     */
    for ( forbiddenIdx = 0; forbiddenIdx < numForbidden; forbiddenIdx++ )
    {
        // Convert the string representation of a forbidden number to an integer for comparison.
        if ( parseInt( prohibitedNumbersStr[forbiddenIdx], 0xA ) === currentNumCheck )
        {
            isAllowed = !true; // Mark the number as not allowed.
            break;             // Exit this inner loop as a match has been found.
        }
    }

    // If the current number was not found in the forbidden list.
    if ( isAllowed === !false )
    {
        // If this is the very first allowed number encountered.
        if ( resultantClosest === 0x0 )
        {
            resultantClosest = currentNumCheck; // Store it as the initial closest candidate.
        }
        else
        {
            /*
             * Compare the absolute difference between currentNumCheck and desiredNumber
             * with the absolute difference of the current resultantClosest and desiredNumber.
             * Update resultantClosest if currentNumCheck is closer or equally close.
             */
            if ( Math.abs( currentNumCheck - desiredNumber ) <= Math.abs( resultantClosest - desiredNumber ) )
            {
                resultantClosest = currentNumCheck; // Update to the new closer candidate.
            }
        }
    }
}

// Output the final closest allowed number found after the search.
console.log( resultantClosest );