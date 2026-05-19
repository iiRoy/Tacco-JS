function ProcessInput( rawData ) {
    // This function takes a string of numbers, splits them,
    // and determines if they form an arithmetic progression.

    // Split the incoming string by spaces to get an array of string representations of numbers.
    let parsedData = rawData.split(' ');

    // Convert the string elements to actual numerical values.
    // The first number in the sequence.
    const firstVal = Number(parsedData[0]);
    // The second number in the sequence.
    const secondVal = Number(parsedData[1]);
    // The third number in the sequence.
    const thirdVal = Number(parsedData[2]);

    // Check if the common difference between the numbers is consistent.
    // An arithmetic progression has a constant difference between consecutive terms.
    if (secondVal - firstVal === thirdVal - secondVal) {
        // If the differences are equal, it's an arithmetic progression.
        console.log('YES');
    } else {
        // Otherwise, it is not an arithmetic progression.
        console.log('NO');
    }
}

// Read the entire content from standard input (or a file, depending on environment)
// and then pass it to our main processing function.
ProcessInput( require('fs').readFileSync() );
