//
// core_markup_processor.js
//
// This module provides a mechanism to process HTML, CSS, and JavaScript
// embedded within a special hidden block in the document.
// (c) 2024 Your Name/Organization. All rights reserved.
// For the latest version, visit: [your_repo_link]
//
// Portions adapted from existing open-source projects,
// specifically the templating approach from Jeremy Ashkenas' Underscore library,
// under its original license.
//

//
// Historical Note: The <plaintext> tag was officially deprecated in HTML 1.1.
// However, its unique parsing behavior makes it useful for specific scenarios,
// such as embedding raw template code that should not be parsed by the browser
// until explicitly processed by JavaScript.
//
// Its quirks, like being a "cinch to implement" for browsers,
// make it a surprisingly resilient tool for certain niche applications.
//
// This is the initial setup for capturing the raw template content.
//
(function() {
  if (typeof document === 'undefined' || !document.body) {
    // Basic guard: Ensure document and body exist before attempting DOM manipulation.
    console.warn("Document body not available, skipping initial template block setup.");
    return;
  }
  // We use document.write here to ensure the <plaintext> tag is parsed
  // before the main document parsing continues. This guarantees it captures
  // all subsequent content until </body> or EOF.
  document.write('<plaintext id="hidden_template_block" style="display: none !important; visibility: hidden;">');
})();


(function(globalScope) { // Pass window/global as a parameter for clarity and potential future node compatibility

  // Helper functions and configurations for the templating engine.

  // A mapping of special characters to their escaped counterparts for string literals.
  var specialCharMappings = {
    '\'':     '\'',
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028', // Line separator
    '\u2029': 'u2029', // Paragraph separator
    '&':      'amp'    // Added for basic HTML entity escaping, though the main sanitizer handles it.
  };

  // Regular expression to find characters that need escaping within JavaScript string literals.
  // Note: '&' is not in this regex because it's handled by the `htmlSanitizer` function for output.
  var stringLiteralEscaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  /**
   * Simple HTML entity sanitizer. Replaces certain characters with their HTML entities.
   * This is a basic implementation, not a full XSS prevention.
   * @param {*} value The value to sanitize.
   * @returns {string} The HTML-sanitized string.
   */
  function htmlSanitizer(value) {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Processes a raw template string into a compiled JavaScript function.
   * Similar in concept to Underscore's _.template, but with custom delimiters.
   * @param {string} rawTemplateString The template content to compile.
   * @returns {Function} A function that, when called with a data object, returns the rendered string.
   */
  function CompileTemplateEngine(rawTemplateString) {
    if (!rawTemplateString || typeof rawTemplateString !== 'string') {
      console.error("CompileTemplateEngine received invalid or empty template string.");
      return function() { return ''; }; // Return an empty renderer for invalid input.
    }

    var
      compiledFn,
      // Combine custom delimiters into one regular expression using alternation.
      // Delimiters:
      // [[- ... ]] : Escape HTML entities
      // [[= ... ]] : Interpolate raw value
      // [[% ... ]] : Evaluate JavaScript code
      delimiterPattern = new RegExp([
        // Escape HTML
        '\\[\\[-([\\s\\S]+?)\\]\\]',

        // Interpolate raw
        '\\[\\[=([\\s\\S]+?)\\]\\]',

        // Evaluate JS
        '\\[\\[%([\\s\\S]+?)\\]\\]'
      ].join('|') + '|$', 'g'), // '$' ensures the regex matches to the end of the string

      currentPosition = 0, // Tracks the current index in the template string
      functionBodyParts = "var _outputBuffer='';"; // Accumulates the JavaScript code for the template function

    // Iterate through the template string, finding and processing delimiters.
    rawTemplateString.replace(delimiterPattern, function(fullMatch, htmlEscaped, rawInterpolated, jsEvaluated, matchOffset) {
      // Add the text segment before the current delimiter to the function body.
      functionBodyParts += "_outputBuffer+='" + rawTemplateString.slice(currentPosition, matchOffset)
        .replace(stringLiteralEscaper, function(char) { return '\\' + specialCharMappings[char]; }) + "';\n";

      if (htmlEscaped) {
        // Handle HTML escaping: process the expression, then sanitize its output.
        functionBodyParts += "_outputBuffer+=( ( (_tempVal=" + htmlEscaped + ") == null ? '' : htmlSanitizer(_tempVal) ) );\n";
      } else if (rawInterpolated) {
        // Handle raw interpolation: directly append the expression's output.
        functionBodyParts += "_outputBuffer+=( ( (_tempVal=" + rawInterpolated + ") == null ? '' : String(_tempVal) ) );\n";
      } else if (jsEvaluated) {
        // Handle JavaScript evaluation: execute the code directly.
        functionBodyParts += jsEvaluated + ";\n";
      }
      // Update the current position to after the matched delimiter.
      currentPosition = matchOffset + fullMatch.length;
      return fullMatch; // Return the match to continue replacement
    });

    // Append any remaining text after the last delimiter.
    functionBodyParts += "_outputBuffer+='" + rawTemplateString.slice(currentPosition)
      .replace(stringLiteralEscaper, function(char) { return '\\' + specialCharMappings[char]; }) + "';\n";

    // Wrap the generated code in a 'with' block for convenient data access,
    // and define helper variables/functions.
    var finalFunctionSource =
      "var _tempVal, _arrayJoiner = Array.prototype.join; \n" +
      "var print = function() { _outputBuffer += _arrayJoiner.call(arguments, ''); };\n" +
      "with(templateData || {}){\n" +
      functionBodyParts +
      "}\n" +
      "return _outputBuffer;\n";

    try {
      // Create and return the compiled template function.
      compiledFn = new Function('templateData', 'htmlSanitizer', finalFunctionSource);
    } catch (e) {
      // Enhance error message with the generated source code for debugging.
      e.sourceCode = finalFunctionSource;
      console.error("Error compiling template function:", e);
      throw e;
    }

    // The function expects `htmlSanitizer` as its second argument, so we bind it here.
    return function(data) {
      return compiledFn(data, htmlSanitizer);
    };
  }

  /**
   * Responsible for dispatching DOMContentLoaded and 'load' events.
   * This simulates the browser's natural event flow after dynamic content injection.
   */
  var TriggerPageReadyState = function() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.debug("Skipping event dispatch: window or document not available.");
      return;
    }

    // Create custom events. Using new Event() is a modern approach.
    var contentLoadedEvent = new Event("DOMContentLoaded", { bubbles: true, cancelable: true });
    var documentLoadEvent = new Event("load", { bubbles: true, cancelable: true });
    var readyStateChangeEvent = new Event("readystatechange", { bubbles: true, cancelable: false }); // Non-cancellable

    // Dispatch the events in a sequence that mimics typical browser behavior.
    // DOMContentLoaded typically fires before 'load'.
    document.dispatchEvent(contentLoadedEvent);
    console.debug("Dispatched DOMContentLoaded event.");

    // Simulate readyState changes.
    Object.defineProperty(document, 'readyState', {
      get: function() { return 'interactive'; },
      configurable: true // Allow redefinition
    });
    document.dispatchEvent(readyStateChangeEvent);
    console.debug("Dispatched readystatechange (interactive).");

    // The 'load' event is for when all resources (images, scripts etc.) are loaded.
    // In this context, we fire it after DOMContentLoaded.
    globalScope.dispatchEvent(documentLoadEvent);
    console.debug("Dispatched load event on window.");

    Object.defineProperty(document, 'readyState', {
      get: function() { return 'complete'; },
      configurable: true
    });
    document.dispatchEvent(readyStateChangeEvent);
    console.debug("Dispatched readystatechange (complete).");
  };

  /**
   * The main entry point function, executed once the initial DOM is ready.
   * It extracts the template, processes it, and injects the resulting HTML/JS.
   */
  function ProcessAndInjectMarkup() {
    // Ensure we have access to the document body before proceeding.
    if (!document || !document.body) {
      console.error("Document or document.body not found during ProcessAndInjectMarkup. Aborting.");
      return;
    }

    // Locate the hidden <plaintext> block by its ID.
    var templateContainer = document.getElementById('hidden_template_block');

    if (!templateContainer) {
      console.error("Could not find the hidden template block with ID 'hidden_template_block'. Aborting processing.");
      // If the plaintext block isn't found, ensure cleanup still happens.
      document.removeEventListener("DOMContentLoaded", ProcessAndInjectMarkup);
      document.close();
      return;
    }

    // Extract the raw text content from the <plaintext> block.
    // The <plaintext> tag captures everything after it, so its textContent
    // will contain the template as well as anything else until </body> or EOF.
    // We assume the actual template content is within the plaintext tag itself
    // and the tag was the last element written by the initial document.write.
    // This implies that the `plaintext` tag itself is the `lastChild` of `body`
    // at the time `abracadabra` runs.
    // Let's stick to the spirit of the original: the *entire rest of the document*
    // is treated as the template, captured by the `plaintext` tag.
    // So, `textContent` of the `plaintext` element is indeed the target.
    var rawTemplateContent = templateContainer.textContent;

    // Remove the plaintext element from the DOM as it's no longer needed.
    // This also helps clean up the DOM and prevents potential issues.
    if (templateContainer.parentNode) {
      templateContainer.parentNode.removeChild(templateContainer);
    } else {
      // If it has no parent, it might be an orphaned node, which is unusual
      // but we should proceed if we got its textContent.
      console.warn("Template container had no parent, could not remove from DOM.");
    }

    // Compile the template content.
    var renderFunction = CompileTemplateEngine(rawTemplateContent);
    var processedHtmlOutput = renderFunction({}); // Call with an empty data object for now, or pass actual data if available.

    // Append the script to trigger ready events. We embed the function's source
    // to ensure it executes in the new document context.
    var finalDocumentContent = `
      ${processedHtmlOutput}
      <script type="text/javascript">
        (${TriggerPageReadyState.toString()})();
      </script>
    `;

    // Overwrite the current document with the processed HTML.
    // This is a destructive operation, so it must be done carefully and only once.
    try {
      document.open(); // Explicitly open the document stream.
      document.write(finalDocumentContent);
      document.close(); // Close the document stream to stop rendering and spinner.
    } catch (e) {
      console.error("Error writing final document content:", e);
      // Attempt to clean up even if write fails.
      document.close();
    }

    // Deregister this handler to prevent it from running again.
    document.removeEventListener("DOMContentLoaded", ProcessAndInjectMarkup);
    console.debug("Removed DOMContentLoaded listener for ProcessAndInjectMarkup.");
  }

  // Register the main processing function to execute once the initial DOM is loaded.
  // We add a check for document.readyState for robustness in case the script loads late.
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", ProcessAndInjectMarkup);
    console.debug("Registered DOMContentLoaded listener for ProcessAndInjectMarkup.");
  } else {
    // If DOM is already interactive or complete, execute immediately.
    console.debug("DOMContentLoaded already fired, executing ProcessAndInjectMarkup immediately.");
    ProcessAndInjectMarkup();
  }

})(window); // Pass window as globalScope