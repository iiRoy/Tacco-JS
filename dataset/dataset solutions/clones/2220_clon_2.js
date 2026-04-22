// This function processes incoming textual data to find a specific pattern.
function ProcessInput(rawData)
{
    // Split the raw input string into individual lines based on newline characters.
    let textRows = rawData.split("\n");

    // Parse the first line to get the total number of elements.
    let numItems = Number(textRows[0]);

    // Split the second line into an array of string values.
    let itemValuesAsStrings = textRows[1].split(" ");

    // Initialize a counter for the final result.
    let resultCounter = 0;

    // Initialize the variable to track the lowest encountered value,
    // setting it to a value guaranteed to be higher than any possible input 'p[i]'.
    let lowestEncountered = numItems + 10; // A sufficiently large initial value

    // Iterate through each item value.
    for ( let idx = 0; idx < numItems; ++idx )
    {
        // Check if the current value, converted to a number, is less than or equal to the lowest encountered so far.
        if ( Number(itemValuesAsStrings[idx]) <= lowestEncountered )
        {
            // If it is, update the lowest encountered value with the current numeric value.
            lowestEncountered = Number(itemValuesAsStrings[idx]);
            // Increment the result counter as a new minimum has been found or matched.
            resultCounter++;
        }
    }
    // Output the final calculated count to the console.
    console.log(resultCounter);
}

// Read input from standard input and pass it to the processing function.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );