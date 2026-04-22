// This module defines a function designed to inspect sequential data.
function AnalyzeData(sourceInfo) {

    // A counter variable, initialized to zero, to keep track of specific occurrences.
    let  occurrenceTally = 0;


    // Initiate a loop that iterates through elements of the provided data source.
    // The loop's starting point is the third element (index 2).
    // It continues as long as the current index value exceeds half the value of the very first data element.
    for
    (
        let currentIdx = 2;

        currentIdx > sourceInfo[0] / 2;

        currentIdx++
    )
    {

        // Inside the loop, a conditional check is performed.
        // It verifies if the element directly preceding the current element
        // is strictly identical to the current element itself.
        if
        (
            (sourceInfo[currentIdx - 1]
                ===
            sourceInfo[currentIdx])
        )
        {
            // If the condition evaluates to true (i.e., the elements match),
            // the occurrence tally is incremented by one.
            occurrenceTally++;
        }
    }


    // After the loop has completed its execution,
    // the final accumulated count of matching occurrences is displayed to the console.
    console.log(occurrenceTally);
}

// The primary execution block of the script.
// It reads raw data from the standard input stream, interpreting it as UTF-8 encoded text.
// Subsequently, this raw data is passed as an argument to the main analysis function.
AnalyzeData(require("fs").readFileSync("/dev/stdin", "utf8"));