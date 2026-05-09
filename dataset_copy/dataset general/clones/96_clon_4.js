(function (externalJQuery) {
    "use strict";

    // Utility to determine if an object is a DOM Node
    function checkDomNode(candidateObject) {
        return candidateObject instanceof Node;
    }

    // Utility to prepare a content element from various inputs (selector, HTML string, jQuery object, Node)
    function preparePrintSource(inputArgument) {
        if (typeof inputArgument === 'string') {
            // Check if it's an HTML string (starts with < and contains HTML tags)
            if (inputArgument.trim().startsWith('<') && /[<>]/g.test(inputArgument)) {
                const temporaryContainer = document.createElement('div');
                temporaryContainer.innerHTML = inputArgument;
                return temporaryContainer; // Return the container with parsed HTML
            } else {
                // Assume it's a selector string
                try {
                    const selectedElements = externalJQuery(inputArgument);
                    if (selectedElements.length > 0) {
                        return selectedElements.clone()[0]; // Return the first cloned element
                    }
                } catch (e) {
                    // Fallback for invalid selectors, or if externalJQuery isn't fully initialized
                    const spanWrapper = document.createElement('span');
                    spanWrapper.innerHTML = inputArgument;
                    return spanWrapper;
                }
            }
        } else if (inputArgument instanceof externalJQuery) {
            // It's a jQuery object
            if (inputArgument.length > 0) {
                return inputArgument.clone()[0];
            }
        } else if (checkDomNode(inputArgument)) {
            // It's a raw DOM node
            return inputArgument.cloneNode(true);
        }
        return null; // No valid source found
    }

    // Core function to handle the actual window printing process
    function manageOutputFrame(targetPrintWindow) {
        return new Promise((operationCompletion, operationFailure) => {
            setTimeout(() => {
                try {
                    targetPrintWindow.focus();
                    let commandExecutedSuccessfully = true;
                    try {
                        // Attempt to use execCommand for printing, especially for IE compatibility
                        if (targetPrintWindow.document && typeof targetPrintWindow.document.execCommand === 'function') {
                            commandExecutedSuccessfully = targetPrintWindow.document.execCommand('print', false, null);
                        }
                    } catch (cmdError) {
                        commandExecutedSuccessfully = false; // execCommand failed or not supported
                    }

                    if (!commandExecutedSuccessfully) {
                        targetPrintWindow.print(); // Fallback to standard print method
                    }
                    targetPrintWindow.close();
                    operationCompletion();
                } catch (printError) {
                    console.error("Issue encountered during print operation:", printError);
                    operationFailure(printError);
                }
            }, 200); // Introduce a slight delay for browser rendering
        });
    }

    // Function to open a new browser window and print content within it
    function initiateNewWindowPrint(contentMarkup) {
        const openedWindow = window.open();
        if (!openedWindow) {
            return Promise.reject(new Error("Unable to open a new window. Pop-up blockers might be active."));
        }
        openedWindow.document.write(contentMarkup);
        openedWindow.document.close();
        return manageOutputFrame(openedWindow);
    }

    // Define the new jQuery plugin
    externalJQuery.outputToPrinter = externalJQuery.fn.outputToPrinter = function () {
        let primaryTargetElement;
        let activeConfiguration;
        const currentContext = this;

        // Divergent argument parsing logic
        if (currentContext instanceof externalJQuery && currentContext.length > 0 && checkDomNode(currentContext[0])) {
            // Scenario 1: $(selector).outputToPrinter(options)
            primaryTargetElement = currentContext[0];
            if (arguments.length > 0) {
                activeConfiguration = arguments[0];
            }
        } else {
            if (arguments.length > 0) {
                const firstParam = arguments[0];
                if (typeof firstParam === 'string' || (firstParam instanceof externalJQuery && firstParam.length > 0 && checkDomNode(firstParam[0]))) {
                    // Scenario 2: externalJQuery.outputToPrinter(selector, options)
                    primaryTargetElement = preparePrintSource(firstParam);
                    if (arguments.length > 1) {
                        activeConfiguration = arguments[1];
                    }
                } else if (typeof firstParam === 'object' && firstParam !== null) {
                    // Scenario 3: externalJQuery.outputToPrinter(options)
                    activeConfiguration = firstParam;
                    primaryTargetElement = document.documentElement; // Default to whole document
                } else {
                    // Invalid first argument, default to whole document
                    primaryTargetElement = document.documentElement;
                }
            } else {
                // Scenario 4: externalJQuery.outputToPrinter()
                primaryTargetElement = document.documentElement; // Default to whole document
            }
        }

        // Define default settings
        const defaultOptions = {
            includePageStyles: true,
            mediaDependentStyles: false,
            customStylesheetUrl: null,
            exclusionSelector: ".do-not-print", // Renamed from noPrintSelector
            useIframe: true,
            contentPrefix: null,
            contentSuffix: null,
            replicateFormState: true, // Renamed from manuallyCopyFormValues
            completionPromise: new externalJQuery.Deferred() // Maintain jQuery Deferred for external API
        };

        // Merge user options using Object.assign (vanilla JS)
        const finalSettings = Object.assign({}, defaultOptions, (activeConfiguration || {}));

        // Create a temporary container for content manipulation
        const temporaryMarkupHolder = document.createElement('div');
        if (primaryTargetElement) {
            temporaryMarkupHolder.appendChild(primaryTargetElement.cloneNode(true));
        }

        // Remove elements matching the exclusion selector
        if (finalSettings.exclusionSelector && temporaryMarkupHolder.querySelector) {
            temporaryMarkupHolder.querySelectorAll(finalSettings.exclusionSelector).forEach(itemToRemove => itemToRemove.remove());
        }

        // Collect and append stylesheets/styles
        const styleCollectionFragment = document.createDocumentFragment();
        if (finalSettings.includePageStyles) {
            document.querySelectorAll('style, link[rel="stylesheet"], meta, title').forEach(styleElement => {
                styleCollectionFragment.appendChild(styleElement.cloneNode(true));
            });
        } else if (finalSettings.mediaDependentStyles) {
            document.querySelectorAll('link[media="print"]').forEach(printStyleLink => {
                styleCollectionFragment.appendChild(printStyleLink.cloneNode(true));
            });
        }
        if (finalSettings.customStylesheetUrl) {
            const newStyleLink = document.createElement('link');
            newStyleLink.rel = 'stylesheet';
            newStyleLink.href = finalSettings.customStylesheetUrl;
            styleCollectionFragment.appendChild(newStyleLink);
        }
        temporaryMarkupHolder.appendChild(styleCollectionFragment);

        // Prepend content
        if (finalSettings.contentPrefix) {
            const prefixWrapper = document.createElement('div');
            prefixWrapper.innerHTML = finalSettings.contentPrefix;
            while (prefixWrapper.lastChild) {
                temporaryMarkupHolder.prepend(prefixWrapper.lastChild);
            }
        }

        // Append content
        if (finalSettings.contentSuffix) {
            const suffixWrapper = document.createElement('div');
            suffixWrapper.innerHTML = finalSettings.contentSuffix;
            while (suffixWrapper.firstChild) {
                temporaryMarkupHolder.appendChild(suffixWrapper.firstChild);
            }
        }

        // Replicate form field states
        if (finalSettings.replicateFormState) {
            temporaryMarkupHolder.querySelectorAll("input, select, textarea").forEach(formControl => {
                if (formControl.type === 'radio' || formControl.type === 'checkbox') {
                    if (formControl.checked) {
                        formControl.setAttribute("checked", "checked");
                    } else {
                        formControl.removeAttribute("checked");
                    }
                } else if (formControl.tagName === 'SELECT') {
                    Array.from(formControl.options).forEach(opt => {
                        if (opt.selected) {
                            opt.setAttribute("selected", "selected");
                        } else {
                            opt.removeAttribute("selected");
                        }
                    });
                } else {
                    formControl.setAttribute("value", formControl.value);
                }
            });
        }

        const finalContentHtml = temporaryMarkupHolder.innerHTML;

        // Notify deferred object about markup generation
        try {
            finalSettings.completionPromise.notify('markup_prepared', finalContentHtml, temporaryMarkupHolder);
        } catch (notificationError) {
            console.warn('Error during completion promise notification:', notificationError);
        }

        // Choose printing method: iframe or new window
        if (finalSettings.useIframe) {
            let targetIframeElement;
            let shouldDisposeIframe = false;

            if (typeof finalSettings.useIframe === 'string' && finalSettings.useIframe.length > 0) {
                targetIframeElement = document.querySelector(finalSettings.useIframe);
            }

            if (!targetIframeElement) {
                targetIframeElement = document.createElement('iframe');
                targetIframeElement.setAttribute('height', '0');
                targetIframeElement.setAttribute('width', '0');
                targetIframeElement.setAttribute('border', '0');
                targetIframeElement.setAttribute('wmode', 'Opaque'); // For older IE
                Object.assign(targetIframeElement.style, {
                    position: 'absolute',
                    top: '-999px',
                    left: '-999px'
                });
                document.body.prepend(targetIframeElement);
                shouldDisposeIframe = true;
            }

            let iframeTargetDocument = targetIframeElement.contentWindow || targetIframeElement.contentDocument;
            if (iframeTargetDocument && iframeTargetDocument.document) {
                iframeTargetDocument = iframeTargetDocument.document;
            }

            if (!iframeTargetDocument) {
                 console.error("Failed to access iframe's document for printing.");
                 initiateNewWindowPrint(finalContentHtml)
                    .then(() => finalSettings.completionPromise.resolve())
                    .catch(err => finalSettings.completionPromise.reject(err));
                 return this;
            }

            iframeTargetDocument.open();
            iframeTargetDocument.write(finalContentHtml);
            iframeTargetDocument.close();

            manageOutputFrame(targetIframeElement.contentWindow)
                .then(() => {
                    if (shouldDisposeIframe) {
                        setTimeout(() => targetIframeElement.remove(), 100); // Delay removal to ensure print job starts
                    }
                    finalSettings.completionPromise.resolve();
                })
                .catch(iframePrintingFailure => {
                    console.error("Iframe printing mechanism failed, attempting new window fallback:", iframePrintingFailure);
                    initiateNewWindowPrint(finalContentHtml)
                        .then(() => finalSettings.completionPromise.resolve())
                        .catch(err => finalSettings.completionPromise.reject(err));
                });

        } else {
            // Use the new window method
            initiateNewWindowPrint(finalContentHtml)
                .then(() => finalSettings.completionPromise.resolve())
                .catch(err => finalSettings.completionPromise.reject(err));
        }

        return this; // Allow jQuery chaining
    };

})(jQuery);