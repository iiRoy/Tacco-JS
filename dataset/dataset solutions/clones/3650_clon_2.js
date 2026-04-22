// This function determines the minimum absolute difference based on permutations.
function ProcessValues(rawLine)
{
    // Convert the input string into an array of numeric elements.
    rawLine = rawLine . split(" ") . map(entry => +entry);

    // Define all possible orderings for three elements (0, 1, 2).
    const elementOrderings = ["012", "021", "102", "120", "201", "210"];

    // Compute the minimum sum of absolute differences across all permutations.
    return Math . min(...elementOrderings . map(
        function(currentOrder)
        {
            // Break down the permutation string into an array of numeric indices.
            currentOrder = currentOrder . split("") . map(charDigit => +charDigit);

            // Calculate the sum of absolute differences for the current permutation:
            // |value_at_index_0 - value_at_index_1| + |value_at_index_1 - value_at_index_2|
            return Math . abs(rawLine[currentOrder[0]] - rawLine[currentOrder[1]]) +
                   Math . abs(rawLine[currentOrder[1]] - rawLine[currentOrder[2]]);
        }
    ));
}

// The subsequent code handles environment-specific execution and display.
// If you are only interested in the core algorithm, you can disregard the following section.

((initialContent, computationResult, resultKind) =>
{
    // Check if running in a Node.js-like environment.
    if (typeof require !== "undefined")
    {
        const fileSys = require("fs");
        const filePath = "/dev/stdin";
        const inputData = fileSys . readFileSync(filePath, "utf8");
        console . log(ProcessValues(inputData));
    }
    else
    {
        // Assume browser environment for display purposes.
        // The initial content string is processed to remove leading/trailing newlines.
        initialContent = initialContent . split("\n") . slice(1, -1) . join("\n");

        // Attempt to execute the primary function with the prepared content.
        computationResult = (function()
        {
            try
            {
                return ProcessValues(initialContent);
            }
            catch (issueDetails)
            {
                // In case of an error, return the stack trace or error message.
                return issueDetails . stack || issueDetails . message;
            }
        })();

        // Determine the type of the computation result.
        resultKind = typeof computationResult;

        // If the result is not a string, convert it to a JSON string for display.
        if (resultKind !== "string")
        {
            computationResult = JSON . stringify(computationResult);
        }

        // Use jQuery to create and append a form with text areas for input and output.
        // Assuming jQuery is available as 'jq'.
        const jq = $;
        jq("<form>")
            .append([
                [10, initialContent], // Input text area: 10 rows, content is initialContent
                0,                    // Line break
                [1, resultKind],      // Type text area: 1 row, content is resultKind
                0,                    // Line break
                [10, computationResult] // Output text area: 10 rows, content is computationResult
            ] . map(displayItem =>
                jq(displayItem ? "<textarea>" : "<br>", displayItem && {
                    rows: displayItem[0],
                    cols: 40,
                    text: displayItem[1]
                })
            ))
            .appendTo("body");
    }
})(`
1 6 3
`);