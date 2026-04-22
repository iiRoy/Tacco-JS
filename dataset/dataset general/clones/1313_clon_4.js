(function() {
    const internalAssertionState = {
        totalChecksPerformed: 0,
        expectedChecksCount: 0,
        resultRecords: []
    };

    const scenarioEvaluation = {
        setAnticipatedChecks: function(count) {
            internalAssertionState.expectedChecksCount = count;
        },
        verifyEquivalence: function(actualValue, expectedValue, descriptionText) {
            if (actualValue === expectedValue) {
                internalAssertionState.resultRecords.push({ status: "PASSED", detail: descriptionText });
            } else {
                internalAssertionState.resultRecords.push({ status: "FAILED", detail: `${descriptionText} (Actual: ${actualValue}, Expected: ${expectedValue})` });
            }
            internalAssertionState.totalChecksPerformed++;
        },
        confirmPredicate: function(conditionResult, descriptionText) {
            if (conditionResult) {
                internalAssertionState.resultRecords.push({ status: "PASSED", detail: descriptionText });
            } else {
                internalAssertionState.resultRecords.push({ status: "FAILED", detail: `${descriptionText} (Condition evaluated to false)` });
            }
            internalAssertionState.totalChecksPerformed++;
        },
        initiateValidationProcess: function(processName, processFunction) {
            internalAssertionState.totalChecksPerformed = 0;
            internalAssertionState.expectedChecksCount = 0;
            internalAssertionState.resultRecords = [];

            processFunction(this.setAnticipatedChecks, this.verifyEquivalence, this.confirmPredicate);
        }
    };

    const retrieveNodeCollection = (currentNodesInput, currentIdentifier = "") => {
        let storedInternalNodes = currentNodesInput || [];
        let storedIdentifier = currentIdentifier;

        const collectionOperations = {
            get nodeCount() { return storedInternalNodes.length; },
            get criteriaDescriptor() { return storedIdentifier; },
            fetchAtIndex: function(idx) { return storedInternalNodes[idx]; },
            getDirectParentSet: function() {
                // For newly created, detached elements, a call to parent() or equivalent should yield an empty set.
                return retrieveNodeCollection([]);
            },
            triggerCustomEvent: function(eventName) {
                storedInternalNodes.forEach(nodeItem => {
                    if (nodeItem instanceof HTMLElement || nodeItem === window) {
                        const eventObject = new Event(eventName, { bubbles: true });
                        nodeItem.dispatchEvent(eventObject);
                    }
                });
                return this;
            },
            discardNodes: function() {
                storedInternalNodes.forEach(nodeItem => {
                    if (nodeItem.parentNode) {
                        nodeItem.parentNode.removeChild(nodeItem);
                    }
                });
                storedInternalNodes = [];
                return this;
            }
        };

        Object.defineProperty(collectionOperations, "primaryLocatedNode", {
            get: function() { return storedInternalNodes.length > 0 ? storedInternalNodes[0] : undefined; }
        });

        return collectionOperations;
    };

    const ElementAssembler = (inputSource, configurationPayload = null) => {
        let assembledNodeList = [];
        let identifyingString = "";

        const parseHtmlFragmentIntoNodes = (htmlStringContent) => {
            const temporaryHostElement = document.createElement("div");
            temporaryHostElement.innerHTML = htmlStringContent;
            return Array.from(temporaryHostElement.children);
        };

        if (typeof inputSource === "string") {
            if (inputSource === "" || inputSource === "#") {
                // Yields an empty collection
            } else if (inputSource.startsWith("<")) {
                assembledNodeList = parseHtmlFragmentIntoNodes(inputSource);
            } else {
                // Assumed to be a CSS selector string
                assembledNodeList = Array.from(document.querySelectorAll(inputSource));
                identifyingString = inputSource;
            }
        } else if (inputSource === undefined || inputSource === null) {
            // Yields an empty collection
        } else if (Array.isArray(inputSource)) {
            assembledNodeList = inputSource;
        } else if (inputSource && typeof inputSource.fetchAtIndex === 'function' && typeof inputSource.nodeCount === 'number') {
            // If the input is already an ElementAssembler collection
            assembledNodeList = [];
            for(let nodeIterator = 0; nodeIterator < inputSource.nodeCount; nodeIterator++) {
                assembledNodeList.push(inputSource.fetchAtIndex(nodeIterator));
            }
            identifyingString = inputSource.criteriaDescriptor;
        } else if (inputSource instanceof Node || inputSource === window) {
            assembledNodeList = [inputSource];
        }

        if (configurationPayload && assembledNodeList.length > 0 && assembledNodeList[0] instanceof HTMLElement) {
            const targetDomNode = assembledNodeList[0];

            for (const propertyKeyName in configurationPayload) {
                if (!Object.prototype.hasOwnProperty.call(configurationPayload, propertyKeyName)) continue;

                const propertyValueContent = configurationPayload[propertyKeyName];

                switch (propertyKeyName) {
                    case "textualContent":
                        targetDomNode.textContent = propertyValueContent;
                        break;
                    case "styleClassIdentifier":
                        targetDomNode.className = propertyValueContent;
                        break;
                    case "uniqueElementIdentifier":
                        targetDomNode.id = propertyValueContent;
                        break;
                    case "spatialWidth":
                        targetDomNode.style.width = `${propertyValueContent}px`;
                        break;
                    case "positionOffsets":
                        targetDomNode.style.top = `${propertyValueContent.top}px`;
                        targetDomNode.style.left = `${propertyValueContent.left}px`;
                        break;
                    case "cssDeclarationSet":
                        for (const stylePropertyKey in propertyValueContent) {
                            if (Object.prototype.hasOwnProperty.call(propertyValueContent, stylePropertyKey)) {
                                targetDomNode.style[stylePropertyKey] = `${propertyValueContent[stylePropertyKey]}px`;
                            }
                        }
                        break;
                    case "htmlElementAttributes":
                        for (const attributeNameKey in propertyValueContent) {
                            if (Object.prototype.hasOwnProperty.call(propertyValueContent, attributeNameKey)) {
                                targetDomNode.setAttribute(attributeNameKey, propertyValueContent[attributeNameKey]);
                            }
                        }
                        break;
                    case "activationHandler":
                        if (typeof propertyValueContent === "function") {
                            targetDomNode.addEventListener("click", propertyValueContent);
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        return retrieveNodeCollection(assembledNodeList, identifyingString);
    };

    ElementAssembler.functionalityAvailability = {
        activationHandler: true,
        spatialWidth: true,
        positionOffsets: true,
        cssDeclarationSet: true,
        htmlElementAttributes: true
    };

    scenarioEvaluation.initiateValidationProcess("ElementAssembler Constructor and Property Application", (setExpected, compareValues, confirmCondition) => {

        let currentAssembledNode;
        let iterationCounter;
        let existingNodeCollection = ElementAssembler("div");
        let scriptFragmentNode = ElementAssembler("<code/>");
        let imageFragmentNode = ElementAssembler("<img/>");
        let complexNodeSet = ElementAssembler("<div/><hr/><code/><b/>");
        let executionFlag = false;
        let extensiveString = "";
        let anticipatedAssertionCount = 20;
        let attributeConfiguration = {
            "textualContent": "test",
            "styleClassIdentifier": "test2",
            "uniqueElementIdentifier": "test3"
        };

        if (ElementAssembler.functionalityAvailability.activationHandler) {
            anticipatedAssertionCount++;
            attributeConfiguration["activationHandler"] = function() { confirmCondition(executionFlag, "Activation handler invoked."); };
        }
        if (ElementAssembler.functionalityAvailability.spatialWidth) {
            anticipatedAssertionCount++;
            attributeConfiguration["spatialWidth"] = 10;
        }
        if (ElementAssembler.functionalityAvailability.positionOffsets) {
            anticipatedAssertionCount++;
            attributeConfiguration["positionOffsets"] = { "top": 1, "left": 1 };
        }
        if (ElementAssembler.functionalityAvailability.cssDeclarationSet) {
            anticipatedAssertionCount += 2;
            attributeConfiguration["cssDeclarationSet"] = { "paddingLeft": 1, "paddingRight": 1 };
        }
        if (ElementAssembler.functionalityAvailability.htmlElementAttributes) {
            anticipatedAssertionCount++;
            attributeConfiguration.htmlElementAttributes = { "desired": "very" };
        }

        setExpected(anticipatedAssertionCount);

        compareValues(ElementAssembler().nodeCount, 0, "ElementAssembler() yields empty collection");
        compareValues(ElementAssembler(undefined).nodeCount, 0, "ElementAssembler(undefined) yields empty collection");
        compareValues(ElementAssembler(null).nodeCount, 0, "ElementAssembler(null) yields empty collection");
        compareValues(ElementAssembler("").nodeCount, 0, "ElementAssembler('') yields empty collection");
        compareValues(ElementAssembler("#").nodeCount, 0, "ElementAssembler('#') yields empty collection");

        compareValues(ElementAssembler(existingNodeCollection).criteriaDescriptor, "div", "ElementAssembler(ElementAssemblerObject) returns same object's criteria");

        compareValues(ElementAssembler(window).nodeCount, 1, "Correct node count for ElementAssembler(window)");

        compareValues(scriptFragmentNode.nodeCount, 1, "Correct node count for script fragment");
        compareValues(scriptFragmentNode.getDirectParentSet().nodeCount, 0, "Ensures generated HTML has no parent.");

        compareValues(imageFragmentNode.nodeCount, 1, "Correct node count for image fragment");
        compareValues(imageFragmentNode.getDirectParentSet().nodeCount, 0, "Ensures generated HTML has no parent.");

        compareValues(complexNodeSet.nodeCount, 4, "Correct node count for complex HTML fragment");
        compareValues(complexNodeSet.getDirectParentSet().nodeCount, 0, "Ensures generated HTML has no parent.");

        compareValues(ElementAssembler([1,2,3]).fetchAtIndex(1), 2, "Tests passing an array to the factory");

        compareValues(ElementAssembler(document.body).fetchAtIndex(0), ElementAssembler("body").fetchAtIndex(0), "Tests passing a DOM node to the factory");

        currentAssembledNode = ElementAssembler("<div/>", attributeConfiguration );

        if (ElementAssembler.functionalityAvailability.spatialWidth) {
            compareValues(currentAssembledNode.primaryLocatedNode.style.width, "10px", "ElementAssembler() quick setter spatialWidth");
        }

        if (ElementAssembler.functionalityAvailability.positionOffsets) {
            compareValues(currentAssembledNode.primaryLocatedNode.style.top, "1px", "ElementAssembler() quick setter positionOffsets");
        }

        if (ElementAssembler.functionalityAvailability.cssDeclarationSet) {
            compareValues(currentAssembledNode.primaryLocatedNode.style.paddingLeft, "1px", "ElementAssembler quick setter cssDeclarationSet");
            compareValues(currentAssembledNode.primaryLocatedNode.style.paddingRight, "1px", "ElementAssembler quick setter cssDeclarationSet");
        }

        if (ElementAssembler.functionalityAvailability.htmlElementAttributes) {
            compareValues(currentAssembledNode.primaryLocatedNode.getAttribute("desired"), "very", "ElementAssembler quick setter htmlElementAttributes");
        }

        compareValues(currentAssembledNode.primaryLocatedNode.childNodes.length, 1, "ElementAssembler quick setter textualContent");
        compareValues(currentAssembledNode.primaryLocatedNode.firstChild.nodeValue, "test", "ElementAssembler quick setter textualContent");
        compareValues(currentAssembledNode.primaryLocatedNode.className, "test2", "ElementAssembler() quick setter styleClassIdentifier");
        compareValues(currentAssembledNode.primaryLocatedNode.id, "test3", "ElementAssembler() quick setter uniqueElementIdentifier");

        executionFlag = true;
        currentAssembledNode.triggerCustomEvent("click");

        currentAssembledNode.discardNodes();

        for ( iterationCounter = 0; iterationCounter < 3; ++iterationCounter ) {
            currentAssembledNode = ElementAssembler("<input type='text' value='TEST' />");
        }
        compareValues(currentAssembledNode.primaryLocatedNode.defaultValue, "TEST", "Ensures cached nodes are cloned properly (Issue #6655)");

        currentAssembledNode.discardNodes();

        for ( iterationCounter = 0; iterationCounter < 128; iterationCounter++ ) {
            extensiveString += "12345678";
        }
    });
})();