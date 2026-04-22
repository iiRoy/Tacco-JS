// This module integrates a specialized markdown rendering utility into a broader UI framework.
// It ensures that the necessary core bundles and templating capabilities are present before activation.
if (typeof GlobalBundle !== 'undefined' && GlobalBundle.templateEngine) {

  // Acquire essential components from the global application bundle.
  // These components are crucial for UI rendering, template management, and markup manipulation.
  const ViewTemplateFactory = GlobalBundle.templateEngine.Template; // Factory for creating new template instances.
  const MarkupUtilities = GlobalBundle.markupUtils.HTML;          // Utilities for handling HTML-like structures and raw content.
  const UserInterfaceEngine = GlobalBundle.uiEngine.Blaze;         // The core UI rendering engine.

  // Register a new user interface helper. This helper is designed to process
  // markdown-formatted text provided within a template block and render it as HTML.
  UserInterfaceEngine.defineUtility('renderFormattedMarkdown', UserInterfaceEngine.createViewComponent('renderFormattedMarkdown', function () {

    // Capture the current rendering context. This 'this' keyword refers to the
    // data context and properties available within the template instance.
    const activeRenderingContext = this;

    // Initialize a string variable to store the raw textual content that will be
    // extracted from the template's content block. It defaults to an empty string.
    let rawContentInput = '';

    // Attempt to locate the content block associated with the current template invocation.
    // This block is where the user's markdown text is typically embedded.
    const contentSegmentReference = activeRenderingContext.contentSourceBlock;

    // A guard clause: If no content segment is found, log a message and proceed
    // with an empty string, preventing potential null reference errors.
    if (!contentSegmentReference) {
      console.debug("Info: No content block detected for markdown processing in the current template instance. Proceeding with an empty string.");
      // rawContentInput is already initialized to '', so no assignment needed here.
    } else {
      // If a content segment exists, serialize its content into a plain text string.
      // This prepares the markdown text for external processing.
      rawContentInput = UserInterfaceEngine._serializeContent(
        contentSegmentReference,
        MarkupUtilities.OUTPUT_FORMAT.PLAIN_TEXT
      );
    }

    // Prepare a variable to hold the HTML output after markdown conversion.
    let finalHtmlOutput = '';

    // Dynamically check for the availability of a global markdown processing function (e.g., 'marked').
    // This provides robustness, allowing the helper to function even if the markdown library is missing.
    const markdownProcessingFunction = (typeof marked !== 'undefined' && typeof marked === 'function') ? marked : null;

    // Conditional execution based on the presence of the markdown processor.
    if (markdownProcessingFunction) {
      try {
        // Execute the markdown conversion. This is the core logic of the helper.
        finalHtmlOutput = markdownProcessingFunction(rawContentInput);
      } catch (conversionExecutionError) {
        // Error handling: If the markdown processor throws an error, log it
        // and provide a user-friendly fallback message within the HTML output.
        console.error("Error occurred during markdown conversion:", conversionExecutionError);
        finalHtmlOutput = `<div class="error-message markdown-processing-failed">
                             <p>An issue prevented markdown conversion. Displaying raw text:</p>
                             <pre>${rawContentInput}</pre>
                           </div>`;
      }
    } else {
      // Fallback behavior: If the markdown processor is not available,
      // log a warning and wrap the raw content in a basic HTML structure.
      console.warn("Warning: Markdown conversion utility ('marked' or similar) is not globally accessible. Displaying raw content without formatting.");
      finalHtmlOutput = `<div class="no-markdown-parser-available">
                           <p>Markdown parser not found. Content displayed as plain text:</p>
                           <pre>${rawContentInput}</pre>
                         </div>`;
    }

    // Return the final HTML content, explicitly marking it as raw.
    // This prevents the UI engine from re-escaping the already generated HTML.
    return MarkupUtilities.Unescaped(finalHtmlOutput);
  }));

} else {
  // A non-critical message indicating that the templating system is not active,
  // thus the markdown helper cannot be registered.
  console.info("Application templating engine or core GlobalBundle not initialized. Markdown helper registration skipped.");
}