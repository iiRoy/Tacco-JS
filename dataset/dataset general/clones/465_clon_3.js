/*
 * This JavaScript module provides a jQuery plugin to facilitate client-side clipboard copying
 * using a Flash-based component (e.g., similar to the original Clippy project).
 * It's designed for web applications requiring direct clipboard interaction via a UI element.
 *
 * NOTE: This solution relies on Adobe Flash Player, which is largely deprecated.
 * Functionality may be limited or non-existent in modern browsers. Use with caution.
 */
(function(jq) {
    // Ensure jQuery is available before attempting to extend its prototype.
    if (!jq || !jq.fn) {
        console.error("ClipIt Plugin: jQuery not found or not fully initialized. Aborting.");
        return; // Exit if jQuery is not present.
    }

    // Extend jQuery's prototype to add our new 'clipit' functionality.
    jq.fn.clipit = function(userOptions) {
        // Define the default configuration for the Flash object and embed elements.
        const defaultFlashComponentSettings = {
            'componentWidth': '14',         // Default width for the Flash button.
            'componentHeight': '14',        // Default height for the Flash button.
            'backgroundColor': '#ffffff',   // Background color for the Flash container.
            'pathToFlashSWF': 'clippy.swf', // Path to the Flash SWF file.
            'preserveHostElementText': false, // If true, original text is appended after the button.
            'initialTextContent': null      // Optional: explicit text to copy, overrides data-text and element text.
        };

        // Merge the user-provided options with our established defaults.
        // A new object `{}` is used as the first argument to prevent modifying `defaultFlashComponentSettings`.
        const runtimeConfig = jq.extend({}, defaultFlashComponentSettings, userOptions);

        // --- Input Validation and Normalization ---
        // Basic check for SWF path validity.
        if (typeof runtimeConfig.pathToFlashSWF !== 'string' || runtimeConfig.pathToFlashSWF.trim() === '') {
            console.warn("ClipIt: 'pathToFlashSWF' is invalid or empty. Defaulting to 'clippy.swf'.");
            runtimeConfig.pathToFlashSWF = 'clippy.swf';
        }

        // Ensure width and height are strings for HTML attributes.
        runtimeConfig.componentWidth = String(runtimeConfig.componentWidth);
        runtimeConfig.componentHeight = String(runtimeConfig.componentHeight);

        // Prepare the common parameters required for the <object> HTML element.
        // These are often passed as <param> tags within the <object>.
        const flashObjectConfig = {
            'movie': runtimeConfig.pathToFlashSWF,
            'allowScriptAccess': 'always',
            'quality': 'high',
            'scale': 'noscale',
            'bgcolor': runtimeConfig.backgroundColor
        };

        // Prepare the common attributes for the <embed> HTML element.
        // The <embed> tag is typically used for non-IE browsers or as a fallback.
        // We'll clone `flashObjectConfig` and then adjust for `embed` specifics.
        const flashEmbedConfig = jq.extend({}, flashObjectConfig, {
            'src': runtimeConfig.pathToFlashSWF, // 'src' is used instead of 'movie' for <embed>.
            'width': runtimeConfig.componentWidth,
            'height': runtimeConfig.componentHeight
        });
        // The 'movie' attribute is specific to <object>'s <param> tag, not directly for <embed>.
        delete flashEmbedConfig.movie;

        // Iterate through each selected DOM element to apply the clipboard functionality.
        // Returning `this.each` ensures jQuery chainability.
        return this.each(function(elementIndex, currentDomElement) {
            const targetElementWrapper = jq(currentDomElement); // Wrap the native DOM element with jQuery.

            // --- Determine the content that should be copied to the clipboard ---
            let clipboardContent = '';
            const explicitTextFromOptions = runtimeConfig.initialTextContent;
            const dataAttributeText = targetElementWrapper.data('text');
            const innerTextOfElement = targetElementWrapper.text();

            if (typeof explicitTextFromOptions === 'string' && explicitTextFromOptions.length > 0) {
                clipboardContent = explicitTextFromOptions;
            } else if (typeof dataAttributeText === 'string' && dataAttributeText.length > 0) {
                clipboardContent = dataAttributeText;
            } else if (typeof innerTextOfElement === 'string' && innerTextOfElement.length > 0) {
                clipboardContent = innerTextOfElement;
            } else {
                // Log a non-critical warning if no content is found, but proceed with an empty string.
                console.info(`ClipIt: No discernible text content found for element at index ${elementIndex}. The copy action may result in an empty clipboard.`);
                clipboardContent = '';
            }

            // URI-encode the content to ensure it's safely passed as a FlashVar.
            const uriEncodedContent = encodeURIComponent(clipboardContent);
            const flashVarsPayload = `text=${uriEncodedContent}`;

            // Create element-specific configurations, as FlashVars change per element.
            const currentObjectParams = jq.extend({}, flashObjectConfig, { 'FlashVars': flashVarsPayload });
            const currentEmbedAttrs = jq.extend({}, flashEmbedConfig, { 'FlashVars': flashVarsPayload });

            // --- Construct the Flash embedding HTML elements ---
            // The <object> element is the primary container for Flash in IE.
            let flashContainerObject = jq('<object />').attr({
                'classid': 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
                'width': runtimeConfig.componentWidth,
                'height': runtimeConfig.componentHeight
            });

            // The <embed> element is typically used for other browsers or as a fallback.
            const flashEmbedComponent = jq('<embed />').attr(currentEmbedAttrs);

            let elementToInsertIntoDOM; // This variable will hold the final jQuery object to inject.

            // Attempt to build the Flash embedding using the <object> element first,
            // with <embed> nested inside for cross-browser compatibility.
            try {
                // Append the <embed> component directly into the <object> container.
                flashContainerObject.append(flashEmbedComponent);

                // For <object> tags, parameters are defined via nested <param> tags.
                // Iterate through the `currentObjectParams` and create a <param> for each.
                jq.each(currentObjectParams, function(paramName, paramValue) {
                    const paramElement = jq('<param />').attr({
                        'name': paramName,
                        'value': paramValue
                    });
                    // Prepend ensures parameters are at the beginning of the object.
                    flashContainerObject.prepend(paramElement);
                });

                elementToInsertIntoDOM = flashContainerObject; // Use the complete object structure.

            } catch (embeddingError) {
                // If appending <embed> to <object> fails (e.g., in some older IE versions
                // or specific browser security contexts), we fall back to using just the <embed> tag.
                console.warn(`ClipIt: Encountered an error during Flash object embedding for element index ${elementIndex}. Falling back to <embed> only. Error:`, embeddingError);
                elementToInsertIntoDOM = flashEmbedComponent; // Use only the embed component as the fallback.
            }

            // --- Insert the generated Flash component into the target DOM element ---
            if (runtimeConfig.preserveHostElementText) {
                // If the original text should be kept, insert the Flash button and then append the decoded text.
                targetElementWrapper.html(elementToInsertIntoDOM).append(decodeURIComponent(uriEncodedContent));
            } else {
                // Otherwise, replace the entire content of the host element with just the Flash button.
                targetElementWrapper.html(elementToInsertIntoDOM);
            }
        }); // End of this.each()
    }; // End of jq.fn.clipit
})(jQuery); // Pass jQuery object into the IIFE.