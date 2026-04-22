/*
 * This module handles processing of financial input streams.
 */
function ProcessFinancialData(rawDataString)
{

    // Split the incoming string by spaces to get individual components.
    let numericComponents = rawDataString.split(" ");

    // The first component represents the number of units available.
    const unitQuantity = parseInt(numericComponents[0], 10);
    // The second component represents the total funds required.
    const requiredFunds = parseInt(numericComponents[1], 10);

    // Check if the total value from the units meets or exceeds the required funds.
    if ( (unitQuantity * 500) >= requiredFunds )
    {
        console.log("YES"); // Indicate success
    }
    else
    {
        console.log("NO"); // Indicate failure
    }
}

// Invoke the primary processing function with data read from standard input.
ProcessFinancialData( require("fs").readFileSync("/dev/stdin", "utf8") );