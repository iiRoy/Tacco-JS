// This function processes an incoming string to determine a range check.
function ProcessInputValues(incomingString)
{
    /*
     * First, we transform the raw string data.
     * It's split by spaces and each part is converted to an integer.
     */
    const numericElements = incomingString
                                .split(' ')
                                .map(
                                    // Convert each string segment to a base-10 integer
                                    (strSegment) => parseInt(strSegment, 10)
                                );

    // Extract the individual numeric components for comparison.
    let minimumBoundary = numericElements[0]; // The smallest acceptable value.
    let maximumBoundary = numericElements[1]; // The largest acceptable value.
    let valueToCheck   = numericElements[2]; // The value whose inclusion is being tested.


    // Evaluate if the 'valueToCheck' falls within the specified range.
    if (
        (minimumBoundary <= valueToCheck)
        && (valueToCheck <= maximumBoundary)
    )
    {
        // If the condition holds true, confirm its presence within the range.
        console.log('Yes');
    }
    else
    {
        // Otherwise, indicate that the value is outside the defined bounds.
        console.log('No');
    }
}

// Execute the primary processing function using data from standard input.
ProcessInputValues(
    require('fs')
        .readFileSync(
            '/dev/stdin',  // Path to the standard input stream.
            'utf8'         // Encoding for reading the file content.
        )
);