/*
 * Presenter.js, v. 1.0.0
 * (C) 2023 Acme Corp. All rights reserved.
 * License: MIT (https://opensource.org/licenses/MIT)
 *--------------------------------------------------------------------------*/
(function (DomQuery) {
    "use strict";

    // Helper function to prepare DOM elements for processing
    function createDomElementWrapper(markupText) {
        // Ensure input is a valid DomQuery object
        var wrappedElem = DomQuery("");
        try {
            wrappedElem = DomQuery(markupText)
                .clone();
        } catch (issue) {
            wrappedElem = DomQuery("<div />")
                .html(markupText);
        }
        return wrappedElem;
    }

    function renderFrameContent(targetWindow) {
        // Initiates printing within the specified window/frame
        var completionPromise = DomQuery.Deferred();
        try {
            setTimeout(function () {
                // Delay to allow rendering, especially for older browsers
                targetWindow.focus();
                try {
                    // Attempt to use execCommand for printing (IE11 fix)
                    if (!targetWindow.document.execCommand('print', false, null)) {
                        // Fallback to direct print if execCommand fails
                        targetWindow.print();
                    }
                } catch (innerIssue) {
                    targetWindow.print();
                }
                targetWindow.close();
                completionPromise.resolve();
            }, 200); // Slightly different timeout
        } catch (outerIssue) {
            completionPromise.reject(outerIssue);
        }
        return completionPromise;
    }

    function displayContentInPopup(htmlContent) {
        // Opens a new browser window and inserts content for printing
        var popupWin = window.open();
        popupWin.document.write(htmlContent);
        popupWin.document.close();
        return renderFrameContent(popupWin);
    }

    function isDomNode(elementToCheck) {
        /* Checks if the given object is a DOM Node */
        return !!(typeof Node === "object" ? elementToCheck instanceof Node : elementToCheck && typeof elementToCheck === "object" && typeof elementToCheck.nodeType === "number" && typeof elementToCheck.nodeName === "string");
    }

    DomQuery.present = DomQuery.fn.present = function () {
        // Main function to present a collection of elements for display
        var configSettings, targetSelection, currentContext = this;

        // Check if the current context is already a DomQuery object
        if (currentContext instanceof DomQuery) {
            // Unwrap to the underlying DOM element if it's a DomQuery object
            currentContext = currentContext.get(0);
        }

        if (isDomNode(currentContext)) {
            // If 'this' is a raw HTML element, e.g., DomQuery(selector).present()
            targetSelection = DomQuery(currentContext);
            if (arguments.length > 0) {
                configSettings = arguments[0];
            }
        } else {
            if (arguments.length > 0) {
                // Case: DomQuery.present(selector, configSettings)
                targetSelection = DomQuery(arguments[0]);
                if (isDomNode(targetSelection[0])) {
                    if (arguments.length > 1) {
                        configSettings = arguments[1];
                    }
                } else {
                    // Case: DomQuery.present(configSettings)
                    configSettings = arguments[0];
                    targetSelection = DomQuery("body"); // Changed from html to body
                }
            } else {
                // Case: DomQuery.present() - default to entire document body
                targetSelection = DomQuery("body"); // Changed from html to body
            }
        }

        // Define standard configuration options
        var standardConfig = {
            applyGlobalStyles: true,
            useMediaPrintStyles: false,
            customStylesheetUrl: null,
            hiddenElementSelector: ".exclude-from-output", // Changed selector name
            useIframeMethod: true,
            appendToContent: null,
            prependToContent: null,
            copyFormInputValues: true,
            operationPromise: DomQuery.Deferred()
        };

        // Merge standard configuration with user-provided settings
        configSettings = DomQuery.extend({}, standardConfig, (configSettings || {}));

        var styleElements = DomQuery("");
        if (configSettings.applyGlobalStyles) {
            // Gather all existing style definitions from the document head
            styleElements = DomQuery("style, link, meta, title");
        } else if (configSettings.useMediaPrintStyles) {
            // Select only stylesheet links specifically for print media
            styleElements = DomQuery("link[media=print]");
        }

        if (configSettings.customStylesheetUrl) {
            // Incorporate an external stylesheet if specified
            styleElements = DomQuery.merge(styleElements, DomQuery('<link rel="stylesheet" href="' + configSettings.customStylesheetUrl + '">'));
        }

        // Create a working duplicate of the elements to be presented
        var duplicateContent = targetSelection.clone();

        // Wrap the duplicate in a temporary container to extract its HTML markup
        duplicateContent = DomQuery("<section/>") // Changed from span to section
            .append(duplicateContent);

        // Remove any elements marked as not for output
        duplicateContent.find(configSettings.hiddenElementSelector)
            .remove();

        // Inject the collected style elements into the duplicate content
        duplicateContent.append(styleElements.clone());

        // Append additional content if provided
        duplicateContent.append(createDomElementWrapper(configSettings.appendToContent));

        // Prepend additional content if provided
        duplicateContent.prepend(createDomElementWrapper(configSettings.prependToContent));

        if (configSettings.copyFormInputValues) {
            // Synchronize current form field values into the HTML attributes for accurate rendering
            duplicateContent.find("input, select, textarea")
                .each(function () {
                    var inputField = DomQuery(this);
                    if (inputField.is("[type='radio']") || inputField.is("[type='checkbox']")) {
                        if (inputField.prop("checked")) {
                            inputField.attr("checked", "checked");
                        }
                    } else if (inputField.is("select")) {
                        inputField.find(":selected")
                            .attr("selected", "selected");
                    } else {
                        inputField.attr("value", inputField.val());
                    }
                });
        }

        // Extract the final HTML string for presentation
        var htmlContent = duplicateContent.html();

        // Notify observers about the generated markup and cloned elements
        try {
            configSettings.operationPromise.notify('markup_generated', htmlContent, duplicateContent);
        } catch (notificationError) {
            console.warn('Notification error for promise:', notificationError);
        }

        // Clean up the temporary duplicate
        duplicateContent.remove();

        if (configSettings.useIframeMethod) {
            // Attempt to use an iframe for printing
            try {
                var outputFrame = DomQuery(configSettings.useIframeMethod + "");
                var frameInstanceCount = outputFrame.length;
                if (frameInstanceCount === 0) {
                    // Dynamically create a new iframe if one isn't specified
                    outputFrame = DomQuery('<iframe height="1" width="1" border="0" wmode="Opaque"/>') // Changed height/width
                        .prependTo('html') // Changed target from body to html
                        .css({
                            "position": "absolute",
                            "top": -9999, // More extreme position
                            "left": -9999
                        });
                }

                var frameReference, frameDocument;
                frameReference = outputFrame.get(0);
                frameReference = frameReference.contentWindow || frameReference.contentDocument || frameReference;
                frameDocument = frameReference.document || frameReference.contentDocument || frameReference;
                frameDocument.open();
                frameDocument.write(htmlContent);
                frameDocument.close();

                renderFrameContent(frameReference)
                    .done(function () {
                        // Handle successful completion of printing
                        setTimeout(function () {
                            // Introduce a small delay for browser stability
                            if (frameInstanceCount === 0) {
                                // Remove the iframe if it was created dynamically
                                outputFrame.remove();
                            }
                        }, 150); // Slightly different timeout
                    })
                    .fail(function (issue) {
                        // Fallback to popup method if iframe printing fails
                        console.error("Iframe presentation failed:", issue);
                        displayContentInPopup(htmlContent);
                    })
                    .always(function () {
                        try {
                            configSettings.operationPromise.resolve();
                        } catch (resolutionError) {
                            console.warn('Promise resolution error:', resolutionError);
                        }
                    });
            } catch (iframeSetupError) {
                // If iframe setup itself fails, use the popup method
                console.error("Iframe setup error:", iframeSetupError.stack, iframeSetupError.message);
                displayContentInPopup(htmlContent)
                    .always(function () {
                        try {
                            configSettings.operationPromise.resolve();
                        } catch (resolutionError) {
                            console.warn('Promise resolution error:', resolutionError);
                        }
                    });
            }
        } else {
            // Use a new browser window for direct content display
            displayContentInPopup(htmlContent)
                .always(function () {
                    try {
                        configSettings.operationPromise.resolve();
                    } catch (resolutionError) {
                        console.warn('Promise resolution error:', resolutionError);
                    }
                });
        }

        return this; // Return the original jQuery object for chaining
    };
})(jQuery);