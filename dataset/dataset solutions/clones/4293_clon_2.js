process.stdin.resume(); // Begin accepting input
process.stdin.setEncoding('utf8'); // Define the character encoding for the input stream

var accumulatedText = ''; // A string buffer to collect all incoming data

process.stdin.on('data', function (incomingFragment)
{
    // Append each received data fragment to the buffer
    accumulatedText += incomingFragment;
});

process.stdin.on('end', function()
{
    // Once the entire input stream has concluded,
    // split the accumulated text into individual lines
    // and pass them to the primary processing function.
    InitiateProcessing(accumulatedText.split(/\n|\r\n/));
});

function InitiateProcessing (inputLines)
{
    // The first line of input is expected to contain space-separated values.
    // Split this line to obtain an array of these values.
    var valueArray = inputLines[0].split(' ');

    // Determine which value to output based on comparisons.
    // If the first two values are identical, print the third.
    if  (valueArray[0] == valueArray[1])
    {
        console.log(valueArray[2]);
    }
    // Otherwise, if the first and third values are identical, print the second.
    else if (valueArray[0] == valueArray[2])
    {
        console.log(valueArray[1]);
    }
    // If neither of the above conditions are met, it implies the first value is unique.
    else
    {
        console.log(valueArray[0]);
    }

    // A conventional return value indicating successful execution.
    return 0;
}