// A utility for printing selected DOM content, based on jQuery.print
// Original work by Sathvik Ponangi, Doers' Guild
// Revised under a permissive license (e.g., MIT, if original allows or is public domain enough)
// Version 2.0 - extensively refactored and modernized.
(function (jqAlias) {
    "use strict";

    // Internal helper for converting HTML strings into a jQuery object safely.
    // Handles potential parsing errors gracefully by wrapping as plain text.
    function convertToJQueryElement(htmlStringInput) {
        let constructedElement = jqAlias(""); // Initialize an empty jQuery set
        if (!htmlStringInput || typeof htmlStringInput !== 'string') {
            return constructedElement; // Return empty if input is invalid
        }
        try {
            // Attempt to parse the input as a DOM structure and create a deep clone.
            constructedElement = jqAlias(htmlStringInput).clone(true, true);
        } catch (parsingError) {
            // If direct parsing fails (e.g., malformed HTML), treat it as plain text.
            console.warn("HTML string parsing failed, treating content as plain text:", parsingError);
            constructedElement = jqAlias("<div />").text(htmlStringInput); // Wrap text in a div
        }
        return constructedElement;
    }

    // Handles the actual triggering of the print dialog on a given window or iframe.
    // Returns a Promise that resolves when the print command is sent, or rejects on error.
    function initiateWindowPrinting(targetWindow) {
        return new Promise((resolvePrint, rejectPrint) => {
            if (!targetWindow || !targetWindow.document) {
                return rejectPrint(new Error("Invalid target window or document for printing operation."));
            }

            // Introduce a short delay to allow the browser to fully render the content
            // before the print dialog appears, crucial for consistency across browsers.
            const printDelayMs = 180;
            setTimeout(() => {
                try {
                    targetWindow.focus(); // Bring the target window to the foreground

                    // Attempt to use 'execCommand' for printing, primarily for older IE versions.
                    // This method can return false if not supported or if the command fails.
                    const printCommandIssued = targetWindow.document.execCommand && targetWindow.document.execCommand('print', false, null);
                    if (!printCommandIssued) {
                        targetWindow.print(); // Fallback to the standard window.print() method
                    }
                    // For modern browsers, window.print() is generally sufficient.

                    // If this window was opened as a new popup (i.e., it has no opener),
                    // close it after the print job has been initiated.
                    if (targetWindow.opener === null) {
                        targetWindow.close();
                    }
                    resolvePrint(); // Indicate that the printing process has been started successfully
                } catch (printExecutionError) {
                    console.error("An error occurred during the print command execution:", printExecutionError);
                    rejectPrint(printExecutionError); // Propagate the error through the promise chain
                }
            }, printDelayMs);
        });
    }

    // Opens a completely new browser window, injects the provided HTML content,
    // and then triggers the printing process within that new window.
    // Returns a Promise from the underlying initiateWindowPrinting function.
    function spawnAndPrintPopup(htmlContent) {
        let newPrintWindowRef = null;
        try {
            // Open a new, blank window with specific features for a print dialog.
            newPrintWindowRef = window.open('', '_blank', 'width=900,height=700,resizable=yes,scrollbars=yes');
            if (!newPrintWindowRef) {
                // If the window reference is null, it means the popup was likely blocked.
                return Promise.reject(new Error("Popup window was blocked by the browser. Please allow popups for printing functionality."));
            }

            // Write the generated HTML markup into the document of the newly opened window.
            newPrintWindowRef.document.open();
            newPrintWindowRef.document.write(htmlContent);
            newPrintWindowRef.document.close();

            return initiateWindowPrinting(newPrintWindowRef);
        } catch (popupCreationError) {
            if (newPrintWindowRef) {
                newPrintWindowRef.close(); // Ensure the window is closed if an error occurs during setup
            }
            return Promise.reject(new Error("Failed to open or write content to new print window: " + popupCreationError.message));
        }
    }

    // A utility function to check if a given object is a genuine DOM element node.
    function isGenuineDomNode(potentialNode) {
        return potentialNode && typeof potentialNode === 'object' && potentialNode.nodeType === 1 && typeof potentialNode.nodeName === 'string';
    }

    // Attaches the printing functionality to jQuery, allowing calls like `$.printModule()`
    // or `$(selector).printPlugin()`.
    jqAlias.printModule = jqAlias.fn.printPlugin = function () {
        const currentExecutionScope = this; // Retain the 'this' context for method chaining

        let printConfiguration = {}; // Object to store merged configuration for the current print job
        let targetDomElements; // The jQuery object representing the elements to be printed

        // Robust argument parsing to handle various call signatures:
        // 1. $(selector).printPlugin(config)
        // 2. $.printModule(selector, config)
        // 3. $.printModule(config)
        // 4. $.printModule()
        if (currentExecutionScope instanceof jqAlias) {
            // Case 1: Method called on a jQuery object (e.g., `$(...).printPlugin(config)`)
            targetDomElements = currentExecutionScope;
            if (arguments.length > 0) {
                printConfiguration = arguments[0];
            }
        } else {
            // Cases 2, 3, 4: Static method call (e.g., `$.printModule(...)`)
            if (arguments.length > 0) {
                const firstArgument = arguments[0];
                if (typeof firstArgument === 'string' || isGenuineDomNode(firstArgument) || firstArgument instanceof jqAlias) {
                    // If the first argument is a selector, DOM node, or jQuery object
                    targetDomElements = jqAlias(firstArgument);
                    if (arguments.length > 1) {
                        printConfiguration = arguments[1];
                    }
                } else if (typeof firstArgument === 'object' && firstArgument !== null) {
                    // If the first argument is a configuration object
                    printConfiguration = firstArgument;
                    targetDomElements = jqAlias("html"); // Default to printing the entire document
                } else {
                    // Fallback for invalid first argument, print entire document
                    console.warn("Invalid first argument provided to printModule; defaulting to printing entire HTML document.");
                    targetDomElements = jqAlias("html");
                }
            } else {
                // No arguments provided, print the entire document by default
                targetDomElements = jqAlias("html");
            }
        }

        // Define a set of default settings for the printing operation.
        const basePrintSettings = {
            includeGlobalStyles: true, // Should `<style>`, `<link>`, `<meta>`, `<title>` tags be copied?
            useMediaPrintStyles: false, // Should only `<link media="print">` stylesheets be included?
            customStylesheetURL: null, // URL to an additional CSS file to include
            excludePrintSelector: ".no-print", // Selector for elements to be hidden/removed during printing
            useIframeForPrinting: true, // Prefer using a hidden iframe for printing (more seamless)
            contentToAppend: null, // HTML string or jQuery object to append to the printed content
            contentToPrepend: null, // HTML string or jQuery object to prepend to the printed content
            copyFormValuesManually: true, // Manually transfer current form field values to HTML attributes
            printJobPromise: jqAlias.Deferred() // A jQuery Deferred object to manage the print job lifecycle
        };

        // Merge the user-provided configuration with the base settings.
        const currentOptions = jqAlias.extend(true, {}, basePrintSettings, (printConfiguration || {}));

        let styleElementsToCopy = jqAlias(""); // Initialize an empty jQuery set for collecting style nodes

        // Logic to determine which stylesheets and meta information to include.
        if (currentOptions.includeGlobalStyles) {
            // Copy all relevant style and meta elements from the current page's head.
            styleElementsToCopy = jqAlias("style, link[rel='stylesheet'], meta[name='viewport'], title");
        } else if (currentOptions.useMediaPrintStyles) {
            // Only include stylesheets specifically marked for print media.
            styleElementsToCopy = jqAlias("link[media='print']");
        }

        // If a custom stylesheet URL is provided, create a new link element for it.
        if (currentOptions.customStylesheetURL) {
            const newCustomLink = jqAlias('<link />').attr({
                rel: 'stylesheet',
                href: currentOptions.customStylesheetURL
            });
            styleElementsToCopy = styleElementsToCopy.add(newCustomLink); // Add it to the collection
        }

        // Create a deep clone of the target DOM elements to avoid modifying the live DOM.
        let contentCloneForPrint = targetDomElements.clone(true, true);

        // Wrap the cloned content in a temporary container (e.g., a div) to easily get its outer HTML.
        contentCloneForPrint = jqAlias("<div />").append(contentCloneForPrint);

        // Remove any elements that are marked with the `excludePrintSelector`.
        contentCloneForPrint.find(currentOptions.excludePrintSelector).remove();

        // Append the collected style elements (cloned) to the content being prepared for printing.
        contentCloneForPrint.append(styleElementsToCopy.clone());

        // Prepend and append any additional custom content specified in the options.
        if (currentOptions.contentToPrepend) {
            contentCloneForPrint.prepend(convertToJQueryElement(currentOptions.contentToPrepend));
        }
        if (currentOptions.contentToAppend) {
            contentCloneForPrint.append(convertToJQueryElement(currentOptions.contentToAppend));
        }

        // Manually copy the current values of form fields into their HTML `value` attributes.
        // This ensures user-modified input is reflected in the printed output.
        if (currentOptions.copyFormValuesManually) {
            contentCloneForPrint.find("input, select, textarea").each(function () {
                const currentFormField = jqAlias(this);
                const inputType = currentFormField.attr("type");

                if (inputType === "radio" || inputType === "checkbox") {
                    if (currentFormField.prop("checked")) {
                        currentFormField.attr("checked", "checked"); // Set 'checked' attribute for checked items
                    } else {
                        currentFormField.removeAttr("checked"); // Ensure 'checked' attribute is absent for unchecked items
                    }
                } else if (currentFormField.is("select")) {
                    currentFormField.children(":selected").attr("selected", "selected"); // Mark selected options
                } else {
                    currentFormField.attr("value", currentFormField.val()); // Set 'value' attribute for text inputs, etc.
                }
            });
        }

        // Extract the complete HTML markup string from the prepared content.
        const finalHtmlMarkup = contentCloneForPrint.html();

        // Notify any listeners on the Deferred object about the generated markup.
        try {
            currentOptions.printJobPromise.notify('markup_generated', finalHtmlMarkup, contentCloneForPrint);
        } catch (notificationError) {
            console.warn('Error occurred while notifying Deferred about markup generation:', notificationError);
        }

        // Remove the temporary cloned content from the DOM.
        contentCloneForPrint.remove();

        // Determine the printing method: using a hidden iframe or a new popup window.
        if (currentOptions.useIframeForPrinting) {
            let iframeReference = null;
            let wasTemporaryIframeCreated = false;

            try {
                // Attempt to find or create an iframe for printing.
                if (typeof currentOptions.useIframeForPrinting === 'string' && currentOptions.useIframeForPrinting.length > 0) {
                    // If a selector string is provided, try to use an existing iframe.
                    iframeReference = jqAlias(currentOptions.useIframeForPrinting);
                }

                // If no specific iframe was found or provided, create a new hidden one.
                if (!iframeReference || iframeReference.length === 0) {
                    iframeReference = jqAlias('<iframe />').attr({
                        height: 0,
                        width: 0,
                        frameborder: 0,
                        wmode: 'Opaque', // For older IE transparency issues
                        class: 'print-utility-iframe-hidden', // Unique class for identification
                        title: 'Hidden Print Utility Frame' // For accessibility
                    }).css({
                        position: 'absolute',
                        top: '-9999px', // Position far off-screen
                        left: '-9999px',
                        border: 'none' // Ensure no visible border
                    }).appendTo('body'); // Add the iframe to the document body
                    wasTemporaryIframeCreated = true;
                }

                const iframeDomElement = iframeReference.get(0);
                const iframeContentWindow = iframeDomElement.contentWindow || iframeDomElement.contentDocument;
                const iframeContentDocument = iframeDomElement.contentDocument || iframeContentWindow.document;

                if (!iframeContentDocument) {
                    throw new Error("Could not access the iframe's document object for writing content.");
                }

                // Write the prepared HTML markup into the iframe's document.
                iframeContentDocument.open();
                iframeContentDocument.write(finalHtmlMarkup);
                iframeContentDocument.close();

                // Trigger printing within the iframe and handle the resulting promise.
                initiateWindowPrinting(iframeContentWindow)
                    .then(() => {
                        // Printing initiated successfully.
                        if (wasTemporaryIframeCreated) {
                            // Give a short grace period for the print dialog before removing the iframe.
                            setTimeout(() => iframeReference.remove(), 200);
                        }
                        currentOptions.printJobPromise.resolve(); // Resolve the main print job promise
                    })
                    .catch(iframePrintFailure => {
                        console.error("Iframe printing mechanism failed, falling back to popup window method:", iframePrintFailure);
                        // If iframe printing fails, attempt to use the popup window method as a fallback.
                        spawnAndPrintPopup(finalHtmlMarkup)
                            .then(() => currentOptions.printJobPromise.resolve())
                            .catch(popupFallbackFailure => {
                                console.error("Popup fallback printing also failed:", popupFallbackFailure);
                                currentOptions.printJobPromise.reject(popupFallbackFailure); // Reject if fallback also fails
                            });
                    });
            } catch (iframeSetupProblem) {
                console.error("An error occurred during iframe setup for printing, attempting popup fallback:", iframeSetupProblem);
                // If iframe setup itself fails, directly attempt the popup window method.
                spawnAndPrintPopup(finalHtmlMarkup)
                    .then(() => currentOptions.printJobPromise.resolve())
                    .catch(popupFallbackFailure => {
                        console.error("Popup fallback printing also failed:", popupFallbackFailure);
                        currentOptions.printJobPromise.reject(popupFallbackFailure);
                    });
            }
        } else {
            // If iframe usage is explicitly disabled, or as a direct fallback, use a new popup window.
            spawnAndPrintPopup(finalHtmlMarkup)
                .then(() => currentOptions.printJobPromise.resolve())
                .catch(directPopupFailure => {
                    console.error("Direct popup window printing failed:", directPopupFailure);
                    currentOptions.printJobPromise.reject(directPopupFailure); // Reject the main promise on failure
                });
        }

        return currentOptions.printJobPromise.promise(); // Return the promise for external chaining and status tracking
    };

})(jQuery);