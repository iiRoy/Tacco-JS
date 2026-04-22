(function() {
    // This self-executing function encapsulates all operations to prevent global scope pollution.

    // A crucial preliminary check: ensure the 'json2html' utility is available.
    // If not found, log an error and gracefully exit, preventing runtime failures.
    if (typeof window.json2html === 'undefined') {
        console.error("Dependency Error: The 'json2html' library is not detected in the global scope. Cannot proceed with transformations.");
        return; // Halt execution if the core library is missing.
    }

    // Define the structural blueprint for transforming JSON data into HTML elements.
    // Each object specifies an HTML tag and how its content or attributes are populated
    // from the incoming data payload using placeholder variables (e.g., ${variableName}).
    const htmlComponentBlueprints = [
        { "tag": "input",    "value": "${quoteSourcePrimary}",  "html": "" }, // Input field for primary quoted string
        { "tag": "input",    "value": "${quoteSourceSecondary}", "html": "" }, // Input field for secondary quoted string
        { "tag": "textarea", "html": "${quoteSourcePrimary}" },               // Textarea for primary quoted string content
        { "tag": "textarea", "html": "${quoteSourceSecondary}" }              // Textarea for secondary quoted string content
    ];

    // Prepare a collection of distinct data payloads, each associated with a descriptive title.
    // This allows for iterating through different test cases using the same transformation rules.
    const contextualDataPayloads = [
        {
            // Scenario 1: Demonstrates handling of various quotation styles within string values.
            descriptiveTitle: 'Analysis of Quotation Mark Representation',
            sourcePayload: {
                quoteSourcePrimary: "'text-with-single-quotes'",
                quoteSourceSecondary: '"text-with-double-quotes"'
            }
        },
        {
            // Scenario 2: Focuses on how HTML special characters are escaped (or not) during rendering.
            descriptiveTitle: 'Assessment of HTML Entity Escaping Mechanisms',
            sourcePayload: {
                quoteSourcePrimary: '<b>Bolded Text Example</b>',
                quoteSourceSecondary: '<i>Italicized Text Example</i>'
            }
        }
    ];

    let aggregatedOutputBuffer = ''; // Initialize an empty string to accumulate all generated HTML.
    let iterationIndex = 0;         // Simple counter to track the progress through data payloads.

    // Loop through each defined data payload to apply the HTML transformation.
    // This replaces individual, hardcoded transformation calls with a dynamic process.
    for (const currentContext of contextualDataPayloads) {
        iterationIndex++; // Increment the counter for the current processing step.

        // Destructure the current context object for easy access to its properties.
        const { descriptiveTitle, sourcePayload } = currentContext;

        // Add an internal HTML comment to the output for better source code readability
        // when inspecting the generated document.
        aggregatedOutputBuffer += `<!-- Begin Section ${iterationIndex}: ${descriptiveTitle} -->\n`;

        // Generate the HTML fragment for the current data payload using the json2html library
        // and the predefined component blueprints.
        const currentHtmlFragment = window.json2html.transform(sourcePayload, htmlComponentBlueprints);

        // Append the generated heading and HTML fragment to our main output buffer.
        aggregatedOutputBuffer += `<h1>${descriptiveTitle}</h1>\n`;
        aggregatedOutputBuffer += currentHtmlFragment;
        aggregatedOutputBuffer += `\n<!-- End Section ${iterationIndex} -->\n\n`; // Concluding comment for the section.
    }

    // After processing all data payloads, write the entire accumulated HTML string
    // to the document. This consolidates multiple 'document.write' calls into one.
    document.write(aggregatedOutputBuffer);

    // Provide a final console log to confirm the completion of the dynamic content generation.
    // This acts as a non-essential informational fragment.
    console.log(`Content rendering procedure finished. Processed ${iterationIndex} distinct data configurations.`);

})();