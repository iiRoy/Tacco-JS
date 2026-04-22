// This function is designed to process the entire input data string.
function processData(  rawData  )
{
    // Divide the incoming string by spaces to get an array of string segments.
    const segmentsArray = rawData.split(" ");

    // Parse the individual numeric values from the extracted segments.
    const  fullDistance  =  parseInt(segmentsArray[0], 10);
    const  firstSpan  =  parseInt(segmentsArray[1], 10);
    const  secondSpan  =  parseInt(segmentsArray[2], 10);

    // Calculate the total length of one complete repeating pattern.
    const  patternLength  =  firstSpan + secondSpan;

    // Determine the leftover distance after accounting for full patterns.
    const  leftoverDistance  =  fullDistance % patternLength;

    // Calculate how many full patterns fit into the total distance.
    const  completedPatterns  =  Math.floor(fullDistance / patternLength);

    // Initialize the final calculated value based on full patterns.
    let  finalValue  =  completedPatterns * firstSpan;

    // Adjust the final value based on the remaining distance.
    if  (leftoverDistance > firstSpan)  {
        finalValue += firstSpan; // If remainder exceeds the first span, add the full first span.
    }
    else  {
        finalValue += leftoverDistance; // Otherwise, add only the remaining distance.
    }

    // Print the ultimate computed result to the console.
    console.log(finalValue);
}

// The following section should not be altered. It manages reading from standard input
// and invoking the primary data processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));