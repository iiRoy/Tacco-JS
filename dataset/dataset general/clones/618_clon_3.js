// A sophisticated JavaScript markup rendering utility.
// This module provides advanced templating capabilities,
// inspired by classic micro-templating patterns.
// Designed for integration with jQuery for DOM manipulation.

// Establish the primary namespace for our rendering toolkit within jQuery.
// This ensures that our components are organized and do not conflict with other plugins.
if (!jQuery.markupProcessor) {
  jQuery.markupProcessor = {};
}

// Initialize a persistent cache for compiled template functions.
// This cache stores the generated render functions to prevent redundant compilation
// when the same template string is used multiple times, significantly boosting performance.
if (!jQuery.markupProcessor.compiledTemplates) {
  jQuery.markupProcessor.compiledTemplates = {};
}

/**
 * Renders a given template string with provided data, optionally inserting the result
 * into a specified DOM element.
 *
 * @param {string} templateContent - The raw template string containing markup and logic.
 * @param {object} [renderData={}] - An object whose properties will be accessible as local variables within the template.
 * @param {jQuery|HTMLElement} [outputTarget] - An optional jQuery object or raw DOM element
 *                                            where the rendered output should be inserted.
 * @returns {string} The fully rendered HTML string.
 */
jQuery.markupProcessor.render = function(templateContent, renderData = {}, outputTarget){
  // --- Input Validation and Pre-processing ---

  // Ensure a valid template string is provided. Without it, rendering is impossible.
  if (typeof templateContent !== 'string' || templateContent.trim() === '') {
    console.error("MarkupProcessor: A non-empty string is required for 'templateContent'. Rendering aborted.");
    return ''; // Return an empty string on invalid template input.
  }

  // Coerce renderData to an object if it's not already, to prevent errors in 'with' scope.
  if (typeof renderData !== 'object' || renderData === null) {
    console.warn("MarkupProcessor: 'renderData' was not an object. Coercing to empty object.");
    renderData = {};
  }

  let processorFn; // This variable will hold our compiled JavaScript rendering function.
  const templateIdentifier = templateContent; // Use the template's content as its unique cache key.

  // --- Template Compilation and Caching Logic ---

  // Check if a compiled version of this template already exists in our cache.
  if(jQuery.markupProcessor.compiledTemplates[templateIdentifier]){
    processorFn = jQuery.markupProcessor.compiledTemplates[templateIdentifier];
    // console.info("MarkupProcessor: Reusing cached template function for efficiency.");
  } else {
    // If the template is not cached, proceed with dynamic compilation.
    // This involves transforming the template string into a executable JavaScript function.
    // console.info("MarkupProcessor: Compiling new template function...");

    // Construct the body of the function step-by-step for better readability and maintainability.
    const functionBodySegments = [
      // Initialize an array to accumulate output parts and a helper function for appending.
      "let outputBuffer=[], appendOutput=function(){outputBuffer.push.apply(outputBuffer,arguments);};",

      // Utilize the 'with' statement to make properties of 'dataContext' directly accessible
      // as local variables within the template's JavaScript sections. This mimics the original
      // micro-templating approach for simplified data access.
      "with(dataContext){appendOutput('",

      // Process the raw template string to convert special tags into JavaScript logic.
      templateContent
        .replace(/\r|\t|\n/g, " ") // Normalize whitespace by replacing newlines/tabs with spaces.
        .split("<%").join("\u0001") // Replace opening script tags with a unique, temporary delimiter (SOH).
        .replace(/((^|\u0002)[^\u0001]*)'/g, "$1\u0003") // Temporarily escape single quotes outside of script blocks.
        .replace(/\u0001=(.*?)\u0002/g, "',$1,'") // Convert output expressions (<%= value %>) into JS string concatenation.
        .split("\u0001").join("');") // Transform script block beginnings into closing string literals and new JS statements.
        .split("\u0002").join("appendOutput('") // Transform script block endings into closing JS statements and new string literals.
        .split("\u0003").join("\\'") // Restore original single quotes, properly escaped for JavaScript.
      , "');}return outputBuffer.join('');" // Finalize the function body: close the 'with' block, close string, and join output.
    ];

    // Create the new function dynamically using the Function constructor.
    // The 'dataContext' parameter will be the 'renderData' object passed to this 'render' method.
    processorFn = jQuery.markupProcessor.compiledTemplates[templateIdentifier] = new Function("dataContext", functionBodySegments.join(''));
  }

  // --- Rendering Execution ---

  // Execute the compiled template function with the provided data to generate the final HTML string.
  const renderedResult = processorFn(renderData);

  // --- Output Delivery ---

  // If an 'outputTarget' element is specified, insert the rendered content into it.
  if(outputTarget){
    // Determine if the target is a jQuery object or a raw DOM element.
    if (outputTarget.jquery) {
      // Validate that the jQuery object actually references existing DOM elements.
      if (outputTarget.length === 0) {
        console.warn("MarkupProcessor: The provided jQuery 'outputTarget' does not select any elements in the DOM. Content not inserted.");
      } else {
        outputTarget.html(renderedResult); // Use jQuery's html() method for insertion.
        // console.log("MarkupProcessor: Content successfully inserted into jQuery target.");
      }
    } else if (typeof outputTarget === 'object' && outputTarget.nodeType === 1) { // Check for raw DOM element.
      try {
        outputTarget.innerHTML = renderedResult; // Directly set innerHTML for raw DOM elements.
        // console.log("MarkupProcessor: Content successfully inserted into raw DOM target.");
      } catch (e) {
        console.error("MarkupProcessor: Failed to set innerHTML on provided raw DOM target:", e);
      }
    } else {
      console.warn("MarkupProcessor: 'outputTarget' is neither a jQuery object nor a valid DOM element. Content not inserted.");
    }
  }

  // Always return the generated HTML string, regardless of whether it was inserted into a target.
  return renderedResult;
};