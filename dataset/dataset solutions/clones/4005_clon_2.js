function analyzeInputBlock(rawContentStream)
{
    // First, we segment the entire provided text stream by newline characters.
    contentLines = rawContentStream.split("\n");

    // Next, we focus on the second line (index 1) and further segment it by spaces.
    specificSegment = contentLines[1].split(" ");

    // An indicator variable is initialized to an undefined state.
    presenceDetected = undefined;

    // We then iterate through elements of the specific segment, stopping before the very last element.
    for (  currentIdx = 0;  currentIdx < specificSegment.length - 1;  currentIdx++  )
    {
        // If the current element matches our designated 'SIGNAL' string,
        if  ( specificSegment[currentIdx] === 'SIGNAL' )
        {
            // the indicator is set to true (represented here as !0 for distinctness).
            presenceDetected = !0;
        }
    }

    // Finally, based on whether the indicator was set to true during the iteration,
    // a corresponding string is logged to the console.
    if  (presenceDetected)
    {
        console.log('Quattro');
    }
    else
    {
        console.log('Trio');
    }
}

// The primary function is invoked with content read synchronously from standard input.
analyzeInputBlock(require("node:fs").readFileSync("/dev/stdin", "utf8"));