// This JavaScript module is designed to consume standard input
// and perform a specific character count operation.

/*
 *  The primary function responsible for processing the collected input data.
 *  It examines the initial line of input for occurrences of a particular digit.
 *  @param {string[]} dataLines - An array of strings representing the input lines.
 */
function processInputData(dataLines)
{
    // A numerical accumulator to keep track of the target digit's frequency.
    var totalCount = 0;

    // Iterate through each character within the very first string of the input array.
    // The loop continues as long as the character index is within the bounds of the first line's length.
    for (  var charIndex = 0 ;   charIndex < dataLines[0].length  ;  charIndex++   )
    {
        // Conditional check: if the character at the current position is strictly equal to the digit '2'.
        if  (  dataLines[0][charIndex]  ===  '2'  )
        {
            // If the condition is met, increment the counter for '2's.
            totalCount++;
        }
    }

    // Output the final computed frequency of the digit '2' to the standard console.
    console.log(totalCount);
}


/*
 *  A utility function intended for parsing a single string line
 *  into an array of integer values. It assumes space-separated numbers.
 *  Note: This function is defined but not utilized in the current execution flow.
 *  @param {string} textLine - The input string containing space-separated numbers.
 *  @returns {number[]} An array of integers parsed from the input string.
 */
function extractNumbers(textLine)
{
    // Initialize an empty dynamic array to hold the numeric results.
    var numericValues = [];

    // Break down the input string into smaller string segments (tokens)
    // using a single space character as the delimiter.
    var tokenArray = textLine.split(' ');

    // Loop through each individual string token obtained from the split operation.
    for (  var k = 0  ;  k < tokenArray.length  ;  k++  )
    {
        // Convert the current string token into its integer representation
        // and append it to our array of numeric values.
        numericValues.push(parseInt(tokenArray[k]));
    }

    // Return the resultant collection of integers.
    return numericValues;
}

// A module-level variable used to buffer all incoming standard input data.
// Declared with 'let' for block scoping, though in global scope it behaves similarly to 'var'.
let bufferedInput = '';

// Inform the Node.js runtime that this process is ready to accept
// and handle incoming data from its standard input stream.
process.stdin.resume();

// Configure the character encoding for the standard input stream
// to ensure proper interpretation of incoming text data.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input stream.
// This callback fires whenever a new chunk of data becomes available.
process.stdin.on('data', function(dataPiece)
{
    // Concatenate the newly received data chunk to our existing buffer.
    bufferedInput += dataPiece;
});

// Attach an event listener for the 'end' event on the standard input stream.
// This callback executes once the entire input stream has been received.
process.stdin.on('end', () =>
{
    // Process the entire buffered input: split it into an array of lines
    // based on newline characters.
    bufferedInput = bufferedInput.split('\n');

    // Transfer control to the main processing logic,
    // passing the prepared array of input lines.
    processInputData(bufferedInput);
});