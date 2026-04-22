// This function processes the incoming string data.
function ProcessInputData( incomingText )
{
    const segmentArray = incomingText.split(" ");
    const firstPart = segmentArray[0];
    const secondPart = segmentArray[1];

    // Display the combined result.
    console.log(secondPart + firstPart);
}

// The following code block handles standard input reading and function invocation. Do not modify it.
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );