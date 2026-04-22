// --- Page Content Output Utility, v2.0.0 ---
// (c) Renovated by a code clone expert
// License: Permissive, for educational purposes
// -------------------------------------------

(function($) {
    "use strict"; // Enforce stricter parsing and error handling

    /**
     * Converts an HTML string or DOM element into a jQuery object,
     * cloning it if it's an existing element, or wrapping it in a div.
     * @param {string|HTMLElement|jQuery} rawInput - The content to process.
     * @returns {jQuery} A jQuery object representing the content.
     */
    function ensureJQueryFragment(rawInput) {
        let processedFragment = $(""); // Start with an empty jQuery object
        try {
            // Attempt to create a jQuery object from the input and clone it
            // Cloning ensures we don't modify the original DOM element if it exists
            processedFragment = $(rawInput).clone(true, true); // Deep clone with data and events
        } catch (error) {
            // If input is not a valid selector or HTML, wrap it in a div
            console.warn("Invalid input for jQuery fragment creation, wrapping in <div>:", error.message);
            processedFragment = $("<div>").html(String(rawInput)); // Ensure it's a string
        }
        return processedFragment;
    }

    /**
     * Determines if a given object is a DOM Node (HTMLElement, TextNode, etc.).
     * Based on https://stackoverflow.com/a/384380/937891, adapted for clarity.
     * @param {*} potentialNode - The object to check.
     * @returns {boolean} True if the object is a DOM Node, false otherwise.
     */
    function isDomNode(potentialNode) {
        if (typeof Node === "object") {
            return potentialNode instanceof Node;
        }
        // Fallback for older browsers or environments where Node is not defined globally
        return potentialNode && typeof potentialNode === "object" &&
               typeof potentialNode.nodeType === "number" &&
               typeof potentialNode.nodeName === "string";
    }

    /**
     * Resolves the target content and configuration for the printing operation
     * based on the function's invocation context and arguments.
     * @param {object} contextRef - The 'this' context of the function call.
     * @param {IArguments} callArgs - The arguments object from the function call.
     * @returns {{ $content: jQuery, config: object }} An object containing the resolved jQuery content and configuration.
     */
    function resolvePrintTargetAndConfig(contextRef, callArgs) {
        let printConfiguration = {};
        let $printTarget;
        const argCount = callArgs.length;

        // Case 1: Method call on a jQuery object (e.g., $(selector).outputPage(config))
        if (contextRef instanceof $) {
            $printTarget = contextRef;
            if (argCount > 0) {
                printConfiguration = callArgs[0];
            }
        }
        // Case 2: Static call (e.g., $.outputPage(...))
        else {
            if (argCount === 0) { // $.outputPage()
                $printTarget = $('html'); // Print the entire document
            } else if (argCount === 1) {
                // $.outputPage(config) OR $.outputPage(selector/element)
                if (typeof callArgs[0] === 'object' && !isDomNode(callArgs[0]) && !(callArgs[0] instanceof $)) {
                    // It's a config object, not a DOM element or jQuery object
                    printConfiguration = callArgs[0];
                    $printTarget = $('html'); // Print entire document with provided config
                } else {
                    // It's a selector string, DOM element, or jQuery object
                    $printTarget = $(callArgs[0]);
                }
            } else { // argCount >= 2: $.outputPage(selector/element, config)
                $printTarget = $(callArgs[0]);
                printConfiguration = callArgs[1];
            }
        }

        // Ensure $printTarget is always a valid jQuery object and contains content
        if (!($printTarget instanceof $)) {
            $printTarget = $($printTarget);
        }
        if ($printTarget.length === 0) {
            console.warn("No specific content identified for printing. Defaulting to 'html'.");
            $printTarget = $('html');
        }

        return { $content: $printTarget, config: printConfiguration };
    }


    // Extend jQuery prototype and global jQuery object with our printing utility
    $.outputPage = $.fn.outputPage = function() {
        let resolved = resolvePrintTargetAndConfig(this, arguments);
        let $contentToProcess = resolved.$content;
        let runtimeConfig = resolved.config;

        console.log("OutputPage invoked. Target:", $contentToProcess.selector || ($contentToProcess[0] ? $contentToProcess[0].tagName : 'N/A'), "Config:", runtimeConfig);

        // Define standard print settings
        const defaultPrinterSettings = {
            includePageStyles: true,           // Include <style>, <link>, <meta>, <title> from current page
            usePrintMediaStyles: false,        // Use <link media="print"> stylesheets
            customStylesheetUrl: null,         // URL for an additional stylesheet
            exclusionSelector: ".no-output",   // Selector for elements to exclude from print
            useIframeMethod: true,             // Use an iframe for printing (more controlled)
            contentToAppend: null,             // HTML content to append to the print area
            contentToPrepend: null             // HTML content to prepend to the print area
        };

        // Merge user-provided settings with defaults
        let finalOutputConfig = $.extend(true, {}, defaultPrinterSettings, (runtimeConfig || {})); // Deep merge for nested options

        let $collectedStylesForOutput = $(); // Initialize an empty jQuery collection

        // Accumulate styles based on configuration
        if (finalOutputConfig.includePageStyles) {
            // Collect all relevant style and meta tags from the current document
            $collectedStylesForOutput = $collectedStylesForOutput.add("style, link[rel='stylesheet'], meta, title");
            console.info("Including global page styles for output.");
        } else if (finalOutputConfig.usePrintMediaStyles) {
            // Only collect stylesheets specifically for print media
            $collectedStylesForOutput = $collectedStylesForOutput.add("link[media='print']");
            console.info("Including print media specific styles for output.");
        }
        if (finalOutputConfig.customStylesheetUrl) {
            // Add a custom stylesheet link if provided
            const $customLink = $('<link rel="stylesheet" href="' + finalOutputConfig.customStylesheetUrl + '" type="text/css">');
            $collectedStylesForOutput = $collectedStylesForOutput.add($customLink);
            console.info("Adding custom stylesheet:", finalOutputConfig.customStylesheetUrl);
        }

        // Prepare the content for printing
        let $tempOutputWrapper = $('<div>').append($contentToProcess.clone(true, true)); // Clone target and wrap in a div
        
        // Remove elements marked for exclusion
        const $elementsToRemove = $tempOutputWrapper.find(finalOutputConfig.exclusionSelector);
        if ($elementsToRemove.length > 0) {
            $elementsToRemove.remove();
            console.log(`Removed ${$elementsToRemove.length} elements matching exclusion selector '${finalOutputConfig.exclusionSelector}'.`);
        } else {
            console.log("No elements found matching the exclusion selector.");
        }
        
        // Append all collected styles to the temporary wrapper
        // Ensure styles are cloned to be independent of the original document
        $tempOutputWrapper.append($collectedStylesForOutput.clone());

        // Prepend and append additional content if specified
        if (finalOutputConfig.contentToPrepend) {
            $tempOutputWrapper.prepend(ensureJQueryFragment(finalOutputConfig.contentToPrepend));
            console.log("Prepended custom content.");
        }
        if (finalOutputConfig.contentToAppend) {
            $tempOutputWrapper.append(ensureJQueryFragment(finalOutputConfig.contentToAppend));
            console.log("Appended custom content.");
        }

        // Extract the final HTML markup
        const finalHtmlMarkup = $tempOutputWrapper.html();

        // Perform cleanup of the temporary wrapper
        $tempOutputWrapper.empty().remove(); // Ensure all children are detached and wrapper is removed from memory

        let printTargetWindow, printTargetDocument;
        let outputMethodUsed = finalOutputConfig.useIframeMethod ? "iframe" : "new window";
        console.info(`Initiating print via ${outputMethodUsed} method.`);

        if (finalOutputConfig.useIframeMethod) {
            // Use an iframe for a more controlled printing experience
            let $outputIframeElement;
            let iframeWasDynamicallyCreated = false;

            try {
                // Check if a specific iframe element selector was provided
                if (typeof finalOutputConfig.useIframeMethod === 'string' && $(finalOutputConfig.useIframeMethod).length > 0) {
                    $outputIframeElement = $(finalOutputConfig.useIframeMethod).first();
                    console.log(`Using existing iframe with selector: ${finalOutputConfig.useIframeMethod}`);
                } else {
                    // Create a new hidden iframe if none is specified or found
                    $outputIframeElement = $('<iframe height="1" width="1" border="0" wmode="Opaque" tabindex="-1"/>')
                        .css({
                            "position": "absolute",
                            "top": "-9999px",
                            "left": "-9999px",
                            "visibility": "hidden", // Keep it off-screen and invisible
                            "opacity": "0"
                        })
                        .appendTo('body'); // Append to body
                    iframeWasDynamicallyCreated = true;
                    console.log("Dynamically created a new iframe for printing.");
                }

                // Access the iframe's window and document objects
                printTargetWindow = $outputIframeElement.get(0).contentWindow || $outputIframeElement.get(0);
                printTargetDocument = printTargetWindow.document || printTargetWindow.contentDocument;

                if (!printTargetDocument) {
                    throw new Error("Could not access iframe document for printing.");
                }

                printTargetDocument.open();
                printTargetDocument.write(finalHtmlMarkup);
                printTargetDocument.close();

                // Delay to allow iframe content to render and then print
                const renderDelayMs = 500; // milliseconds
                const cleanupDelayMs = 200; // milliseconds

                setTimeout(() => {
                    try {
                        printTargetWindow.focus(); // Focus the iframe window
                        printTargetWindow.print(); // Initiate print command
                        console.log("Print command sent to iframe.");

                        // Delay cleanup to ensure print dialog has time to appear
                        setTimeout(() => {
                            if (iframeWasDynamicallyCreated) {
                                $outputIframeElement.remove(); // Remove dynamically created iframe
                                console.log("Dynamically created iframe removed after printing.");
                            } else {
                                console.log("Using existing iframe, not removing it.");
                            }
                        }, cleanupDelayMs);
                    } catch (printError) {
                        console.error("Error during iframe printing process:", printError);
                        alert("Printing via iframe failed. Please check console for details.");
                        if (iframeWasDynamicallyCreated) {
                            $outputIframeElement.remove();
                        }
                    }
                }, renderDelayMs);

            } catch (iframeSetupError) {
                console.error("Failed to setup iframe for printing, falling back to new window method:", iframeSetupError.message);
                // Fallback to new window method if iframe setup fails
                finalOutputConfig.useIframeMethod = false; // Disable iframe for this attempt
                // The following 'if' block will now handle the printing
            }
        }

        // If iframe method is explicitly disabled or failed as a fallback
        if (!finalOutputConfig.useIframeMethod) {
            try {
                // Open a new, temporary window for printing
                printTargetWindow = window.open('', '_blank', 'height=600,width=800,resizable=yes,scrollbars=yes');
                if (!printTargetWindow) {
                    throw new Error("Popup window blocked. Please allow popups for printing.");
                }
                printTargetDocument = printTargetWindow.document;

                printTargetDocument.open();
                printTargetDocument.write(finalHtmlMarkup);
                printTargetDocument.close();

                printTargetWindow.focus();
                printTargetWindow.print();
                printTargetWindow.close(); // Close the new window after printing
                console.log("Print command sent to new window.");
            } catch (newWindowError) {
                console.error("Failed to print using new window:", newWindowError);
                alert("Printing failed. Please check your browser settings for popups or console for errors.");
            }
        }
        
        // Return the original jQuery object for chaining
        return this;
    };

})(jQuery);