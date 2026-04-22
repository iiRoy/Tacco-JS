function ProcessEntries(sourceContent)
{
    // First, divide the incoming content into individual lines.
    let entryList = sourceContent.split("\n");

    // Initialize auxiliary variables for sorting operations.
    var firstIndex = 0, innerPointer = 0, swapBuffer = 0;

    // This section implements a basic bubble sort algorithm
    // to arrange the elements in ascending order.
    // The outer loop iterates nearly through the entire list.
    for
    (
        var currentPos = 0;
        currentPos < entryList.length - 1;
        currentPos++
    )
    {
        // The inner loop compares adjacent elements and performs swaps.
        // It starts from the end and moves towards the outer loop's current position.
        for (
             innerPointer = entryList.length - 1;
             innerPointer > currentPos;
             innerPointer--
            )
        {
            // If an element is smaller than its preceding element, swap them.
            if (entryList[innerPointer] < entryList[innerPointer - 1])
            {
                // Store the smaller value temporarily.
                swapBuffer = entryList[innerPointer];

                // Move the larger value to the current position.
                entryList[innerPointer] = entryList[innerPointer - 1];

                // Place the smaller value in the previous position.
                entryList[innerPointer - 1] = swapBuffer;
            }
        }
    }


    // After sorting, print the last four elements of the processed list.
    // Note: This logic might output 'undefined' if the array has fewer than 4 elements
    // or if the original input contains an empty line at the end, as `length` refers
    // to the total count of elements, and array indices are zero-based.
    for (
        var currentPos = 0;
        currentPos < 4;
        currentPos++
    )
    {
        console.log(entryList[entryList.length - currentPos]);
    }
}


function runDebugMode()
{
    // This helper function retrieves user input from a web page element
    // and passes it to the main processing function.
    var debugInputContent = webPage.fetchElement("input").textValue;

    ProcessEntries(debugInputContent);
}


// The primary execution block:
// It reads data from a standard input file using Node.js filesystem module
// and then initiates the main data processing routine.
ProcessEntries(loadModule("diskIO").readSourceFile("/dev/stdin", "utf8"));