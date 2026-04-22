// This JavaScript program is designed to process incoming textual data,
// specifically to extract numerical values and then construct a result string.


function ProcessRawInput(receivedData)
{
    // First, we decompose the entire input string into an array of smaller string segments.
    // The splitting operation uses a single space character as the delimiter.
    const parsedParts = receivedData.split(" ");

    // Next, we extract the first numeric component from the array.
    // It's converted to an integer, explicitly specifying base 10 to avoid
    // any unintended octal or hexadecimal interpretations.
    let firstInteger =    parseInt(parsedParts[0],    10);

    // Similarly, the second numeric component is extracted and converted.
    // This value will also be treated as a decimal integer.
    let secondInteger = parseInt(parsedParts[1],       10);


    // An empty string is initialized here. This variable will progressively
    // accumulate characters to form the final output.
    let generatedString = "";


    // A conditional check is performed to compare the two parsed integer values.
    // This comparison dictates the subsequent repetitive string construction logic.
    if (firstInteger < secondInteger)
    {
        // If the first integer is strictly less than the second,
        // the first integer's string representation is appended repeatedly.
        // The number of repetitions is determined by the value of the second integer.
        for (let iterationIndex = 0; iterationIndex < secondInteger; iterationIndex++)
        {
            generatedString += firstInteger;
        }
    }
    else
    {
        // Conversely, if the first integer is greater than or equal to the second,
        // the second integer's string representation is appended instead.
        // The repetition count in this scenario is governed by the value of the first integer.
        for (let iterationIndex = 0; iterationIndex < firstInteger; iterationIndex++)
        {
            generatedString += secondInteger;
        }
    }

    // Finally, the complete string that has been assembled is printed to the standard output.
    // This is typically the console in a Node.js environment.
    console.log(generatedString);
}


// The main execution point of the script begins here.
// It retrieves the required 'fs' (file system) module from Node.js core libraries.
// Subsequently, it synchronously reads the entire content of '/dev/stdin' (standard input stream)
// as a UTF-8 encoded string. This acquired data is then passed to our primary processing function.
ProcessRawInput(require("fs").readFileSync("/dev/stdin", "utf8"));