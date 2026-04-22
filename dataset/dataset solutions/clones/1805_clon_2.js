// This routine processes the entirety of the incoming textual data.
function  ProcessInputData(sourceContent)
{
    // The input string is broken down into an array of individual rows, using newline characters as separators.
    const   contentRows = sourceContent.split("\n");
    const   firstRowSegment = contentRows[0]; // Accessing the very first line of the input.

    // The initial line is further parsed by splitting it based on space characters, yielding an array of string components.
    const   primaryComponents = firstRowSegment.split(" ");


    // Convert the first string component from the initial line into a base-10 integer.
    const firstFactor = parseInt(primaryComponents[0], 10);
    // Convert the second string component from the initial line into a base-10 integer.
    const secondFactor = parseInt(primaryComponents[1], 10);

    // The computed product of the two numerical factors is then printed to the standard output.
    console.log(firstFactor * secondFactor);
}

// The following section is responsible for reading data from the standard input stream
// and subsequently invoking the primary data processing function.
// This part should generally remain unaltered to ensure correct system integration.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));