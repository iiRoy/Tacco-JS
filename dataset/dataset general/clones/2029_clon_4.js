(function() {
    "use strict";

    // Utility function to verify if an object is a DOM Node
    function verifyNodeKind(candidateObject) {
        return !!(typeof Node === "object" ? candidateObject instanceof Node : candidateObject && typeof candidateObject === "object" && typeof candidateObject.nodeType === "number" && typeof candidateObject.nodeName === "string");
    }

    // Utility to generate DOM elements from a string or clone an existing node
    function generateDomElements(sourceInput) {
        if (typeof sourceInput === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sourceInput;

            // If the input is plain text, wrap it in a span to mimic jQuery's behavior
            if (tempDiv.children.length === 0 && tempDiv.childNodes.length > 0) {
                 const textWrap = document.createElement('span');
                 textWrap.appendChild(document.createTextNode(sourceInput));
                 return textWrap;
            }

            // For HTML strings, create a DocumentFragment to hold potentially multiple root elements
            const fragmentContainer = document.createDocumentFragment();
            while (tempDiv.firstChild) {
                fragmentContainer.appendChild(tempDiv.firstChild);
            }
            return fragmentContainer;
        } else if (verifyNodeKind(sourceInput)) {
            return sourceInput.cloneNode(true);
        }
        return null;
    }

    // Core object encapsulating printing logic
    const documentPrintEngine = {
        // Standard print configuration
        standardConfiguration: {
            includePageStyles: true,
            usePrintMediaQueries: false,
            linkedStylesheetUrl: null,
            omitElementsSelector: ".no-print",
            renderInIframe: true,
            contentPrefix: null,
            contentSuffix: null
        },

        // Main entry point for initiating a print job
        beginPrintOperation: function(targetSubject, operationOptions) {
            let selectedDomElement;
            let finalOptions = Object.assign({}, this.standardConfiguration, (operationOptions || {}));

            // Determine the target element and options based on arguments
            if (typeof targetSubject === 'object' && targetSubject !== null && !verifyNodeKind(targetSubject) && !(typeof jQuery !== 'undefined' && targetSubject instanceof jQuery) && typeof operationOptions === 'undefined') {
                // Scenario: printHandler({ options })
                finalOptions = Object.assign({}, this.standardConfiguration, targetSubject);
                selectedDomElement = document.documentElement; // Default to entire HTML
            } else {
                // Scenario: printHandler(target, options) or printHandler(target)
                if (typeof targetSubject === 'string') {
                    selectedDomElement = document.querySelector(targetSubject);
                    if (!selectedDomElement) {
                        console.warn("Print target not found for selector:", targetSubject);
                        return;
                    }
                } else if (verifyNodeKind(targetSubject)) {
                    selectedDomElement = targetSubject;
                } else if (typeof jQuery !== 'undefined' && targetSubject instanceof jQuery) {
                    selectedDomElement = targetSubject[0]; // Extract first DOM element from jQuery object
                    if (!selectedDomElement) {
                        console.warn("jQuery object provided for printing is empty.");
                        return;
                    }
                } else {
                    selectedDomElement = document.documentElement; // Default to entire HTML
                }
            }

            if (!selectedDomElement) {
                console.warn("No valid DOM element identified for printing.");
                return;
            }

            // Assemble the HTML content for printing
            const preparedHtmlMarkup = this.constructPrintableContent(selectedDomElement, finalOptions);

            // Execute the print action
            this.executePrintingProcess(preparedHtmlMarkup, finalOptions);

            // If a jQuery object was passed, return it for potential chaining
            if (typeof jQuery !== 'undefined' && targetSubject instanceof jQuery) {
                return targetSubject;
            }
        },

        // Builds the full HTML string including styles and additional content
        constructPrintableContent: function(elementForProcessing, currentOptions) {
            const temporaryHoldingContainer = document.createElement('div');
            const clonedElement = elementForProcessing.cloneNode(true);

            // Remove elements marked for exclusion
            if (currentOptions.omitElementsSelector) {
                clonedElement.querySelectorAll(currentOptions.omitElementsSelector).forEach(el => el.remove());
            }

            temporaryHoldingContainer.appendChild(clonedElement);

            // Gather and append styles
            const gatheredStyleNodes = this.fetchPageStyles(currentOptions);
            gatheredStyleNodes.forEach(styleNode => temporaryHoldingContainer.appendChild(styleNode));

            // Prepend user-defined content
            if (currentOptions.contentPrefix) {
                const prefixFragment = generateDomElements(currentOptions.contentPrefix);
                if (prefixFragment) temporaryHoldingContainer.prepend(prefixFragment);
            }
            // Append user-defined content
            if (currentOptions.contentSuffix) {
                const suffixFragment = generateDomElements(currentOptions.contentSuffix);
                if (suffixFragment) temporaryHoldingContainer.append(suffixFragment);
            }

            return temporaryHoldingContainer.innerHTML;
        },

        // Collects relevant style declarations from the document head
        fetchPageStyles: function(currentOptions) {
            const styleElementList = [];
            if (currentOptions.includePageStyles) {
                document.head.querySelectorAll('style, link, meta, title').forEach(node => {
                    styleElementList.push(node.cloneNode(true));
                });
            } else if (currentOptions.usePrintMediaQueries) {
                document.head.querySelectorAll('link[media="print"]').forEach(node => {
                    styleElementList.push(node.cloneNode(true));
                });
            }
            if (currentOptions.linkedStylesheetUrl) {
                const customLink = document.createElement('link');
                customLink.rel = 'stylesheet';
                customLink.href = currentOptions.linkedStylesheetUrl;
                styleElementList.push(customLink);
            }
            return styleElementList;
        },

        // Manages the actual printing process, either using an iframe or a new window
        executePrintingProcess: function(generatedHtml, currentOptions) {
            let outputTargetWindow;
            let targetOutputDocument;

            if (currentOptions.renderInIframe) {
                try {
                    let printingFrameElement = null;
                    let existingFrameReference = document.querySelector(currentOptions.renderInIframe === true ? 'iframe[data-print-session-frame]' : currentOptions.renderInIframe);

                    if (existingFrameReference) {
                        printingFrameElement = existingFrameReference;
                    } else {
                        printingFrameElement = document.createElement('iframe');
                        printingFrameElement.style.cssText = "position:absolute; top:-999px; left:-999px; height:0; width:0; border:0; opacity:0;";
                        printingFrameElement.setAttribute('data-print-session-frame', 'true');
                        document.body.appendChild(printingFrameElement);
                    }

                    outputTargetWindow = printingFrameElement.contentWindow || printingFrameElement.contentDocument;
                    targetOutputDocument = printingFrameElement.contentDocument || printingFrameElement.contentWindow.document;

                    targetOutputDocument.open();
                    targetOutputDocument.write(generatedHtml);
                    targetOutputDocument.close();

                    setTimeout(() => {
                        outputTargetWindow.focus();
                        outputTargetWindow.print();
                        setTimeout(() => {
                            if (!existingFrameReference) { // Only remove if we created it
                                printingFrameElement.remove();
                            }
                        }, 100); // Short delay for cleanup
                    }, 250); // Delay for iframe content rendering
                } catch (issue) {
                    console.error("Printing via iframe encountered an error, falling back to new window:", issue.stack || issue.message || issue);
                    this.printInNewBrowserWindow(generatedHtml);
                }
            } else {
                this.printInNewBrowserWindow(generatedHtml);
            }
        },

        // Opens a new browser window to display and print content
        printInNewBrowserWindow: function(markupPayload) {
            const newPrintWindow = window.open('', '_blank');
            if (!newPrintWindow) {
                alert('Pop-up blocker detected! Please allow pop-ups for printing functionality.');
                return;
            }
            newPrintWindow.document.open();
            newPrintWindow.document.write(markupPayload);
            newPrintWindow.document.close();
            newPrintWindow.focus();
            newPrintWindow.print();
            newPrintWindow.close();
        }
    };

    // Expose the printing functionality globally under a new name
    window.unifiedPrintHandler = function(firstArgument, secondArgument) {
        return documentPrintEngine.beginPrintOperation(firstArgument, secondArgument);
    };

})();