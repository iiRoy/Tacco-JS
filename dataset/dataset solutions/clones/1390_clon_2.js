/* This module processes pairs of numerical values provided as text input. */
(   function   (   inputText   )      {
    // The initial input string is parsed by newline characters,
    // creating an array where each element represents a single line of data.
    var   inputLines   =   inputText.split('\n');

    // A processing loop is initiated to iterate through each line of the collected input.
    // 'lineCounter' serves as the index for the current line being processed.
    // 'totalLineCount' stores the total number of lines available in the input.
    for
        (
            var lineCounter = 0, totalLineCount = inputLines.length;
            lineCounter < totalLineCount;
            lineCounter++
        )
    {
        // Each individual line is further segmented by space characters,
        // expecting to yield two distinct parts, typically representing numbers.
        var currentLineParts = inputLines[lineCounter].split(' ');

        // The first segment of the current line is converted into a numeric type.
        // The idiom '- 0' is employed for explicit type coercion from string to number.
        var numOne = currentLineParts[0] - 0;

        // Similarly, the second segment of the current line is converted into a numeric type.
        var numTwo = currentLineParts[1] - 0;

        // A specific condition is checked to determine if the processing should terminate.
        // If both numerical values extracted from the line are zero, it signals an end.
        if
        (
            numOne === 0
            &&
            numTwo === 0
        )
        {
            // Upon detecting the termination condition, the loop is exited prematurely.
            break;
        }

        // The two numerical values are compared to establish their relative order.
        if
        (
            numOne <= numTwo
        )
        {
            // If the first number is less than or equal to the second,
            // they are outputted to the console in their current order, separated by a space.
            console.log(numOne + ' ' + numTwo);
        }
        else
        {
            // Otherwise, if the first number is greater,
            // the numbers are outputted in reverse order to ensure ascending presentation.
            console.log(numTwo + ' ' + numOne);
        }
    }
}
)
(
    require("fs")
        .readFileSync
            (
                "/dev/stdin",
                "utf8"
            )
)
; /* End of the primary script execution block. */