// This module serves as a central registry for various HTML rendering functions.
// It uses an Immediately Invoked Function Expression (IIFE) to encapsulate its scope
// and prevent global variable pollution, ensuring a clean and modular design.
(function initializeRenderingModule() {
  'use strict'; // Enforce strict JavaScript parsing and execution rules.

  // Establish a global container for our rendering functions.
  // We use `globalThis` for compatibility across different JavaScript environments
  // (e.g., browser `window`, Node.js `global`, Web Workers `self`).
  // If `HTMLRenderers` doesn't exist, it's initialized as an empty object.
  globalThis.HTMLRenderers = globalThis.HTMLRenderers || {};

  /**
   * Generates a static HTML document, primarily for informational display.
   * This function demonstrates a template that outputs fixed content without
   * relying on dynamic data from the rendering context.
   *
   * @param {object} renderContext - The data object provided for rendering.
   *                                 Although passed, it's not utilized in this static template.
   * @returns {string} The fully rendered HTML string of the informational page.
   * @throws {TypeError} If the final rendered output is not a string.
   */
  globalThis.HTMLRenderers['staticInfoPage'] = function renderStaticInfoPage(renderContext) {
    // The core rendering logic is wrapped in another IIFE.
    // This allows `this` inside to refer directly to `renderContext`, mimicking
    // how some templating engines bind context.
    return (function generatePageMarkup() {
      // Define a constant for the newline character, used for joining HTML segments.
      const lineFeedCharacter = "\n";
      // An array to collect pieces of the HTML output before final assembly.
      let htmlContentFragments = [];

      // This template's content is entirely static. It's stored as a multi-line string.
      // For dynamic templates, this section would involve more variable interpolation.
      const predefinedPageStructure = `<!DOCTYPE html>
<div id='main-container'>
  <div class='content-block'>
    <h2>Important Development Notes</h2>
    <ul>
      <li>
        Templating systems like Haml-Coffee typically enforce indentation rules.
        Consistent spacing (e.g., two spaces) is crucial for correct parsing,
        even if the exact count can be flexible.
      </li>
      <li>
        The leading character of each line often acts as a "directive" or
        "control character," instructing the parser to create an element,
        execute embedded script, or other operations.
      </li>
      <li>
        A key advantage of such templating is the automatic generation of
        well-structured and correctly indented HTML output.
      </li>
      <li>
        These systems frequently support embedding and executing
        code snippets (e.g., CoffeeScript) directly within templates.
      </li>
    </ul>
  </div>
  <div class='content-block'>
    For more in-depth information, please consult the
    <a href='https://github.com/netzpirat/haml-coffee'>
      Official Haml Coffee Documentation Repository on GitHub
    </a>
  </div>
  <div class='content-block'>
    <p>
      To include CoffeeScript code or expressions within a template,
      a common convention is to prefix the line with an equals sign (=).
    </p>
    <p>
      A complete tutorial is available for detailed guidance on advanced features.
    </p>
  </div>
</div>`;

      // Add the static HTML content to our buffer.
      htmlContentFragments.push(predefinedPageStructure);

      // Perform a preliminary check: if no content was added, return an empty string.
      if (htmlContentFragments.length === 0) {
        console.warn("The HTML content buffer was unexpectedly empty for 'staticInfoPage'.");
        return "";
      }

      // Join all collected fragments into a single string.
      // Then, apply a final cleanup regex to remove any empty `id=""` or `class=""` attributes.
      // This is a common post-processing step in some templating engines.
      const finalHtmlResult = htmlContentFragments
        .join(lineFeedCharacter)
        .replace(/\s(?:id|class)=(['"])(\1)/mg, "");

      // Validate the output type to ensure it's a string, as expected.
      if (typeof finalHtmlResult !== 'string') {
        throw new TypeError("Rendered output from 'staticInfoPage' must be a string.");
      }

      return finalHtmlResult;
    }).call(renderContext); // Bind the external `renderContext` as `this` for the inner function.
  };

}).call(this); // The outer IIFE is invoked with the global `this` context.

// Another module, extending the `HTMLRenderers` registry with more dynamic templates.
(function extendRenderingModule() {
  'use strict'; // Enforce strict mode.

  // Ensure the global `HTMLRenderers` object exists, creating it if necessary.
  globalThis.HTMLRenderers = globalThis.HTMLRenderers || {};

  /**
   * Generates an HTML article with dynamic text and attributes,
   * demonstrating advanced templating features like value coercion and HTML escaping.
   *
   * @param {object} inputData - The data context for rendering, expected to contain
   *                             properties like 'greet' and 'class'.
   * @returns {string} The fully rendered HTML string of the dynamic article.
   */
  globalThis.HTMLRenderers['dynamicArticleGenerator'] = function renderDynamicArticleGenerator(inputData) {
    // The template's core logic is self-contained within this IIFE,
    // where `this` will refer to the `inputData` object.
    return (function generateDynamicArticleMarkup() {
      // A special marker used internally by Haml-Coffee to signify boolean attribute values.
      // This allows distinguishing between literal 'true'/'false' strings and boolean flags.
      const HAML_BOOLEAN_FLAG_PREFIX = '';
      const NEWLINE_CHAR = "\n"; // Standard newline character for output.

      /**
       * Converts any given content to a string and then escapes HTML special characters.
       * This is a crucial security measure to prevent Cross-Site Scripting (XSS) attacks
       * when embedding potentially untrusted data into HTML.
       *
       * @param {any} rawContent - The value to be escaped. Can be string, number, null, etc.
       * @returns {string} The HTML-safe string version of the content.
       */
      const escapeHtmlText = (rawContent) => {
        // Ensure the content is always treated as a string, handling null/undefined safely.
        let stringifiedContent = String(rawContent === null || rawContent === undefined ? '' : rawContent);
        // Apply a series of replacements for common HTML entities.
        return stringifiedContent
          .replace(/&/g, '&amp;')   // Ampersand must be escaped first.
          .replace(/"/g, '&quot;')   // Double quotes.
          .replace(/'/g, '&#39;')    // Single quotes (apostrophes).
          .replace(/</g, '&lt;')     // Less than sign.
          .replace(/>/g, '&gt;')     // Greater than sign.
          .replace(/\//g, '&#47;');  // Forward slash (good practice, especially in script tags).
      };

      /**
       * Coerces input values into a specific format expected by Haml-Coffee for attributes.
       * It handles null/undefined by returning an empty string, and prefixes boolean values
       * with a special marker for later processing.
       *
       * @param {any} valueToCoerce - The raw value from the context.
       * @returns {string|any} The coerced value, potentially prefixed for booleans.
       */
      const coerceForAttributeProcessing = (valueToCoerce) => {
        // If the value is null or undefined, treat it as an empty string.
        if (valueToCoerce === null || valueToCoerce === undefined) {
          return '';
        }
        // If the value is a boolean, prefix it with our special marker.
        // This allows the final regex to correctly interpret 'true'/'false' as boolean attributes.
        else if (typeof valueToCoerce === 'boolean') {
          return HAML_BOOLEAN_FLAG_PREFIX + String(valueToCoerce);
        }
        // For all other types, return the value as is.
        return valueToCoerce;
      };

      // An array to store the generated HTML fragments before they are joined.
      let generatedHtmlSegments = [];

      // `this` inside this IIFE refers to `inputData` due to `.call(inputData)`.
      const currentDataItem = this;

      // Basic validation: Check if `currentDataItem` is a valid object.
      if (!currentDataItem || typeof currentDataItem !== 'object') {
        console.error("Invalid or missing data context provided for 'dynamicArticleGenerator'.");
        return ""; // Return an empty string if context is invalid.
      }

      // --- Dynamic Content Generation ---

      // 1. Prepare the dynamic greeting for the H1 tag.
      // Provide a default value ('user') if `currentDataItem.greet` is not set.
      const greetingPhrase = currentDataItem.greet ? `hello ${currentDataItem.greet}` : 'Greetings, user!';
      // Apply coercion and HTML escaping.
      const processedGreeting = escapeHtmlText(coerceForAttributeProcessing(greetingPhrase));

      // 2. Prepare the dynamic class attribute for the DIV tag.
      const initialClasses = ['modifier-a', 'custom-component']; // Base classes always present.
      const contextualClassRaw = currentDataItem['class']; // Accessing a property that might be named 'class'.
      let processedContextualClass = '';

      // If a contextual class is provided, process it.
      if (contextualClassRaw !== undefined && contextualClassRaw !== null) {
        processedContextualClass = escapeHtmlText(coerceForAttributeProcessing(contextualClassRaw));
      }

      // Combine all class names, filter out any empty strings, sort them alphabetically,
      // and then join them with a single space. Finally, trim any excess whitespace.
      const finalClassAttributeValue = [...initialClasses, processedContextualClass]
        .filter(Boolean) // Removes null, undefined, empty strings, 0, false.
        .sort()          // Sorts class names for consistent output.
        .join(' ')
        .trim();         // Remove leading/trailing spaces.

      // --- HTML Markup Construction ---

      // Construct the main article HTML using template literals for clarity.
      const articleContentMarkup = `<article>
  <h1>${processedGreeting}</h1>
  <section id='article-detail-section'>This section provides specific details.</section>
  <div class='${finalClassAttributeValue}'>This element features dynamically generated classes.</div>
</article>`;

      generatedHtmlSegments.push(articleContentMarkup);

      // --- Final Output Formatting and Cleanup ---

      /**
       * Applies Haml-Coffee specific post-processing to the generated HTML.
       * This involves converting boolean attribute markers into actual HTML attributes.
       * @param {string} rawHtml - The HTML string before final processing.
       * @returns {string} The HTML string after boolean attribute conversion and cleanup.
       */
      const applyFinalHtmlFormatting = (rawHtml) => {
        // Regex to convert 'attribute="true"' into ' attribute'.
        const trueBooleanAttrRegex = new RegExp(`\\s([\\w-]+)='${HAML_BOOLEAN_FLAG_PREFIX}true'`, 'mg');
        // Regex to remove 'attribute="false"'.
        const falseBooleanAttrRegex = new RegExp(`\\s([\\w-]+)='${HAML_BOOLEAN_FLAG_PREFIX}false'`, 'mg');
        // Regex to clean up any remaining empty 'id=""' or 'class=""' attributes.
        const emptyIdClassAttrRegex = /\s(?:id|class)=(['"])(\1)/mg;

        return rawHtml
          .replace(trueBooleanAttrRegex, ' $1') // ' attribute="true"' becomes ' attribute'
          .replace(falseBooleanAttrRegex, '')   // ' attribute="false"' is removed entirely
          .replace(emptyIdClassAttrRegex, '');  // Remove any empty id/class attributes
      };

      // Join all collected HTML segments and apply the final formatting.
      const finalRenderedOutput = applyFinalHtmlFormatting(generatedHtmlSegments.join(NEWLINE_CHAR));

      // Final check: if the output is unexpectedly empty, log a warning.
      if (!finalRenderedOutput) {
        console.warn("The final rendered output for 'dynamicArticleGenerator' was empty.");
      }

      return finalRenderedOutput;
    }).call(inputData); // Execute the inner function, binding `inputData` as its `this` context.
  };

}).call(this); // Invoke the outer IIFE with the global `this` context.