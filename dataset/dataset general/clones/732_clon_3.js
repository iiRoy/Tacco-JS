/**
 * Utility script for dynamically rendering a collection of command-line snippets.
 *
 * This component expects a specific DOM element to exist on the page, identified by its ID.
 * The generated HTML content, comprising a list of command snippets and an attribution footer,
 * will be injected into this designated container.
 *
 * The input data should be an array of objects, where each object represents a command snippet
 * and must contain 'command', 'summary', and 'url' properties for proper rendering.
 *
 * For more details on the data structure, consult the API documentation at:
 *   http://www.commandlinefu.com/site/widget/
 *
 * @author CLI Snippet Dev Team <dev@example.com>
 * @version 1.1.0
 */
function renderSnippetList(snippetCollection, displayLimit = 5) {
    // Define the constant ID for the target HTML element where content will be displayed.
    // This ID must match the element present in the document.
    const TARGET_ELEMENT_IDENTIFIER = 'commandlinefu_list';

    // --- Input Validation and Guard Clauses ---
    // Ensure the provided collection is a valid array and contains data.
    if (!Array.isArray(snippetCollection) || snippetCollection.length === 0) {
        console.warn('Snippet Renderer: No valid data collection provided or collection is empty. Aborting render.');
        return;
    }

    // Determine the actual number of items to process, respecting the display limit.
    const effectiveItemCount = Math.min(displayLimit, snippetCollection.length);

    // Initialize an array to accumulate individual snippet HTML fragments.
    let generatedItemFragments = [];

    // --- Data Processing and HTML Generation ---
    // Iterate through the determined number of snippets to create their HTML.
    for (let currentIdx = 0; currentIdx < effectiveItemCount; ++currentIdx) {
        const itemData = snippetCollection[currentIdx];

        // Use destructuring assignment for clearer extraction of properties.
        // Also, rename properties for better context within this function.
        const {
            command: cliInstruction,
            summary: briefExplanation,
            url: resourceLink
        } = itemData;

        // Perform a quick check for essential data points for the current item.
        if (!cliInstruction || !briefExplanation || !resourceLink) {
            console.warn(`Snippet Renderer: Skipping malformed snippet entry at index ${currentIdx}. Missing essential data.`);
            continue; // Move to the next item if this one is incomplete.
        }

        // Construct the HTML for a single list item using template literals for readability.
        // Introduce additional whitespace for formatting if the output is inspected.
        generatedItemFragments.push(
            `  <li>
                <a href="${resourceLink}" target="_blank" rel="noopener noreferrer">${briefExplanation}</a><br/>
                <code>$ ${cliInstruction}</code>
              </li>`
        );
    }

    // If no fragments were generated (e.g., all were malformed), exit early.
    if (generatedItemFragments.length === 0) {
        console.info('Snippet Renderer: No valid snippets were generated for display.');
        return;
    }

    // Assemble the complete unordered list structure from the fragments.
    const finalSnippetListMarkup = `<ul>\n${generatedItemFragments.join('\n')}\n</ul>`;

    // Define the attribution footer separately.
    // Changed the image to a text link with simple styling.
    const attributionFooterMarkup = `<p style="text-align: right; margin-top: 10px;">
                                       <a href="https://www.commandlinefu.com" target="_blank" rel="noopener noreferrer"
                                          style="font-size: 0.8em; color: #777; text-decoration: none;">
                                         Powered by Command-Line Fu
                                       </a>
                                     </p>`;

    // Combine the list and the footer into the final content block.
    const ultimateDisplayContent = `${finalSnippetListMarkup}\n${attributionFooterMarkup}`;

    // --- DOM Injection ---
    // Retrieve the target container element from the DOM.
    const targetElementNode = document.getElementById(TARGET_ELEMENT_IDENTIFIER);

    // Verify that the target element actually exists before attempting to inject HTML.
    if (targetElementNode) {
        // Inject the fully constructed HTML into the target element.
        targetElementNode.innerHTML = ultimateDisplayContent;
    } else {
        // Log an error if the designated element could not be found.
        console.error(`Snippet Renderer: Target DOM element with ID "${TARGET_ELEMENT_IDENTIFIER}" not found. Cannot inject content.`);
    }
}