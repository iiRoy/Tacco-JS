(function(documentContext, windowContext) {
    const internalServices = {
        messaging: {
            alert: (textMessage) => console.warn(textMessage)
        },
        dataManipulation: {
            traverseCollection: (items, processingFunction) => Array.from(items).forEach(processingFunction),
            refineString: (inputStr) => (inputStr || '').toString().trim(),
            lowerCaseString: (inputStr) => (inputStr || '').toString().toLowerCase(),
            matchExpression: (inputStr, regexPattern) => regexPattern.test(inputStr),
            transformToArray: (iterable) => Array.from(iterable)
        },
        domInteraction: {
            locateElements: (cssSelector, contextNode) => (contextNode || documentContext).querySelectorAll(cssSelector),
            extractTagName: (elementNode) => elementNode ? (elementNode.nodeName || '').toLowerCase() : '',
            createUrlObject: (urlPath) => new URL(urlPath, documentContext.location.href)
        }
    };

    const warningOutput = internalServices.messaging;
    const stringAndArrayTools = internalServices.dataManipulation;
    const domQueryAndUrlTools = internalServices.domInteraction;

    const currentBaseDocumentLocation = domQueryAndUrlTools.createUrlObject(documentContext.URL || documentContext.location.href);

    const findOptimalStyleSheetLink = (sourceDocument) => {
        const potentialSources = domQueryAndUrlTools.locateElements('link', sourceDocument.head);

        const scoreAndSelectBest = (currentBestCandidate, candidateElement) => {
            if (candidateElement.nodeType !== 1) return currentBestCandidate;

            const relationshipIdentifier = stringAndArrayTools.refineString(candidateElement.rel);
            if (!stringAndArrayTools.matchExpression(relationshipIdentifier, /^\s*MEEKO-DECOR\s*$/i)) {
                return currentBestCandidate;
            }

            const mimeType = stringAndArrayTools.lowerCaseString(candidateElement.type || '');
            let calculatedScore = 0;

            if (mimeType === 'text/html' || mimeType === '') {
                calculatedScore += 1;
            } else {
                warningOutput.alert("Incompatible resource type for decor: " + mimeType);
                return currentBestCandidate;
            }

            const mediaCondition = candidateElement.getAttribute('media');
            if (mediaCondition) {
                if (windowContext.matchMedia && windowContext.matchMedia(mediaCondition).matches) {
                    calculatedScore += 2;
                } else {
                    return currentBestCandidate;
                }
            }

            if (calculatedScore > (currentBestCandidate ? currentBestCandidate.score : -1)) {
                return { ref: candidateElement, score: calculatedScore };
            }
            return currentBestCandidate;
        };

        const result = stringAndArrayTools.transformToArray(potentialSources).reduce(scoreAndSelectBest, null);
        return result ? result.ref : null;
    };

    const getResolvedDecorResourcePath = (targetDocument) => {
        const chosenLinkElement = findOptimalStyleSheetLink(targetDocument);
        if (!chosenLinkElement) {
            return null;
        }
        const resourceLocation = chosenLinkElement.getAttribute("href");
        return new URL(resourceLocation, currentBaseDocumentLocation).href;
    };

    const cleanseDocumentHeader = (documentToProcess, requestInformation) => {
        const removalMarker = 'nodecor';
        const documentHeader = documentToProcess.head;

        const elementsToPrune = stringAndArrayTools.transformToArray(documentHeader.childNodes).filter(item => {
            const nodeCategory = domQueryAndUrlTools.extractTagName(item);
            if (nodeCategory !== 'style' && nodeCategory !== 'link') {
                return false;
            }

            const elementDesignation = stringAndArrayTools.lowerCaseString(stringAndArrayTools.refineString(item.title));
            return elementDesignation === removalMarker;
        });

        elementsToPrune.forEach(item => {
            documentHeader.removeChild(item);
        });
    };

    const applyConcealingState = (eventObject) => {
        eventObject.node.setAttribute("data-display-status", "hidden-by-script");
        eventObject.node.setAttribute("aria-hidden", "true");
    };
    const removeConcealingState = (eventObject) => {
        eventObject.node.removeAttribute("data-display-status");
        eventObject.node.removeAttribute("aria-hidden");
    };
    const executeNoOperation = (eventObject) => { /* This function intentionally does nothing */ };

    if (typeof Meeko !== 'undefined' && Meeko.decor && Meeko.panner) {
        Meeko.decor.config({
            detect: (docObject) => getResolvedDecorResourcePath(docObject)
        });

        Meeko.panner.config({
            normalize: (docObject, detailsPayload) => cleanseDocumentHeader(docObject, detailsPayload),
            duration: 0,
            nodeRemoved: { before: applyConcealingState, after: removeConcealingState },
            nodeInserted: { before: applyConcealingState, after: removeConcealingState },
            pageOut: { before: executeNoOperation, after: executeNoOperation },
            pageIn: { before: executeNoOperation, after: executeNoOperation }
        });
    }

})(document, window);