const styleCraft = (function() {
    let permitExcessiveSheets = false;

    const acquireHeadNode = () => document.getElementsByTagName('head')[0];

    const furnishSheetContent = (targetNode, cssPayload) => {
        return new Promise((completion, failure) => {
            try {
                if (targetNode.styleSheet) { // IE-specific property
                    targetNode.styleSheet.cssText = cssPayload;
                } else if (Object.prototype.hasOwnProperty.call(targetNode, 'textContent')) {
                    targetNode.textContent = cssPayload;
                } else {
                    targetNode.appendChild(document.createTextNode(cssPayload));
                }
                completion();
            } catch (exception) {
                failure(exception);
            }
        });
    };

    const generateAndPlaceSheet = (anchorNode) => {
        return new Promise((completion, failure) => {
            const newStyleNode = document.createElement('style');
            newStyleNode.setAttribute('type', 'text/css');
            const headContainer = acquireHeadNode();

            if (anchorNode) {
                headContainer.insertBefore(newStyleNode, anchorNode);
            } else {
                headContainer.appendChild(newStyleNode);
            }

            // Specific check for IE's stylesheet limit (KB262161)
            if (newStyleNode.styleSheet && newStyleNode.styleSheet.disabled) {
                headContainer.removeChild(newStyleNode);
                return failure(new Error('Stylesheet creation failed: Maximum allowable stylesheets exceeded (KB262161).'));
            }
            completion(newStyleNode);
        });
    };

    const dismantleStyleNode = (nodeToRemove) => {
        if (nodeToRemove && nodeToRemove.tagName === 'STYLE' && nodeToRemove.parentNode) {
            nodeToRemove.parentNode.removeChild(nodeToRemove);
        }
    };

    const coordinateStyleOperation = (operationConfig) => {
        return new Promise((completion, failure) => {
            if (!permitExcessiveSheets && document.styleSheets.length >= 31) {
                return failure(new Error('Stylesheet creation failed: Maximum allowable stylesheets exceeded (KB262161).'));
            }

            const effectiveAnchor = operationConfig.elementToReplace ? operationConfig.elementToReplace.nextSibling : operationConfig.insertBeforeElement;

            generateAndPlaceSheet(effectiveAnchor)
                .then(freshStyleNode => {
                    return furnishSheetContent(freshStyleNode, operationConfig.content || "")
                        .then(() => {
                            if (operationConfig.elementToReplace) {
                                dismantleStyleNode(operationConfig.elementToReplace);
                            }
                            completion(freshStyleNode);
                        })
                        .catch(issue => {
                            dismantleStyleNode(freshStyleNode); // Clean up if content setting fails
                            failure(issue);
                        });
                })
                .catch(issue => failure(issue));
        });
    };

    return {
        setIgnoreStylesheetLimit: (enable) => {
            permitExcessiveSheets = !!enable;
        },
        addStyle: (cssContent, done) => {
            coordinateStyleOperation({ cssContent: cssContent })
                .then(styleNode => done(null, styleNode))
                .catch(issue => done(issue));
        },
        prependStyleTo: (targetElement, cssContent, done) => {
            coordinateStyleOperation({ insertBeforeElement: targetElement, cssContent: cssContent })
                .then(styleNode => done(null, styleNode))
                .catch(issue => done(issue));
        },
        swapStyleFor: (oldElement, cssContent, done) => {
            coordinateStyleOperation({ elementToReplace: oldElement, cssContent: cssContent })
                .then(styleNode => done(null, styleNode))
                .catch(issue => done(issue));
        },
        removeStyle: (targetNode) => {
            dismantleStyleNode(targetNode);
        }
    };
})();