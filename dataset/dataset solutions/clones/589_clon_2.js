const rawData=require('node:fs').readFileSync('/dev/stdin', 'utf-8'); // Acquire data from standard input stream.
const dataLines = (rawData.trim()).split('\n'); // Process the incoming text, splitting it into an array of distinct lines.
while
(
true
)
{ // Initiate an indefinite processing cycle.
    let initialValue = Number(dataLines.shift()); // Extract the primary numerical indicator for the current block.
    if
(
initialValue === 0
)
break; // If the primary indicator is zero, terminate the entire operation.
    let accumulatedTotal = 0; // Prepare a variable to accumulate subsequent numerical elements.
    for
(
let loopIndex = 0; loopIndex < 10; loopIndex++
)
accumulatedTotal += (Number(dataLines.shift())); // Iterate precisely ten times, adding each sequential numerical entry to the running total.
    console.log(initialValue - accumulatedTotal); // Display the result of subtracting the accumulated sum from the initial indicator.
}