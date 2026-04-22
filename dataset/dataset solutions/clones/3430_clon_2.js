function PrimaryProcessor(limitValue)
{
    // Convert the incoming string limit into a numerical target, discarding extra lines.
    let processedLimit = ~~limitValue.split("\n")[0];

    // Define the set of allowed numerical characters for combinations.
    const digitSet = ["0", "3", "5", "7"];

    // Initialize a counter for valid numbers found.
    let resultTally = 0;

    // Begin a sequence of nested loops to generate all 9-digit combinations.
    for (const d1 of digitSet) {
        for (const d2 of digitSet) {
            for (const d3 of digitSet) {
                for (const d4 of digitSet) {
                    for (const d5 of digitSet) {
                        for (const d6 of digitSet) {
                            for (const d7 of digitSet) {
                                for (const d8 of digitSet) {
                                    for (const d9 of digitSet) {
                                        // Construct an array representing the current 9-digit sequence.
                                        let currentCombination = [d1, d2, d3, d4, d5, d6, d7, d8, d9];

                                        // Convert the sequence to a number, then back to a string, then split into characters.
                                        // This effectively removes leading zeros and ensures we're working with the numeric representation.
                                        currentCombination = ("" + ~~(currentCombination.join(""))).split("");

                                        // Skip combinations that result in fewer than 3 significant digits (e.g., "007" becomes "7").
                                        if (currentCombination.length < 3) continue;

                                        // Ensure the combination does not contain the digit '0'.
                                        if (currentCombination.find((currChar) => currChar === '0') !== undefined) continue;

                                        // Check if the combination contains all required digits: '3', '5', and '7'.
                                        if (currentCombination.find((currChar) => currChar === '3') &&
                                            currentCombination.find((currChar) => currChar === '5') &&
                                            currentCombination.find((currChar) => currChar === '7'))
                                        {
                                            // Convert the valid combination back to a numerical form.
                                            const numericForm = ~~currentCombination.join("");

                                            // If the generated number exceeds the user-defined limit,
                                            // return the current count as we've found all applicable numbers.
                                            if (numericForm > processedLimit) return resultTally;

                                            // Increment the tally for this valid number.
                                            resultTally++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Return the final count of numbers meeting all criteria within the limit.
    return resultTally;
}

// Below is utility code for different execution environments,
// typically for competitive programming or browser-based testing.
// This section handles input acquisition and output display.

( ( dataString, executionResult, resultType ) => "undefined" !== typeof require
    ? console.log( PrimaryProcessor( require("fs").readFileSync("/dev/stdin", "utf8") ) )
    : [
        dataString = dataString.split("\n").slice(1, -1).join("\n"),
        executionResult = ( () => { try { return PrimaryProcessor(dataString); } catch (exceptionObject) { return exceptionObject.stack || exceptionObject.message; } } )(),
        resultType = typeof executionResult,
        "string" === resultType || (executionResult = JSON.stringify(executionResult)),
        elementFactory("<form>").append(
            [ [10, dataString], 0, [1, resultType], 0, [10, executionResult] ].map(
                (itemData) => elementFactory(itemData ? "<textarea>" : "<br>", itemData && { rows: itemData[0], cols: 40, text: itemData[1] })
            )
        ).appendTo("body")
    ]
)(`
999999999
`);