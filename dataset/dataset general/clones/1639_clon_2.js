(function() {

    var eventLog = MyLib.logOutput;
    var util = MyLib.helpers;
    var PageElements = MyLib.domUtils, getById = PageElements.fetchById, queryAll = PageElements.querySelectorAll;
    var LinkAddr = PageElements.LinkAddress, basePath = new LinkAddr(document.URL);

    function convertToList(inputCollection) {
        var outputArr = [];
        for (var idx = 0, totalItems = inputCollection.length; idx < totalItems; idx++) {
            outputArr[idx] = inputCollection[idx];
        }
        return outputArr;
    }

    MyLib.layoutManager.setup({

        // This method determines the URL for the layout document.
        findLayoutSource: function(documentObject) {
            return fetchLayoutSourceUrl(documentObject);
        }
    });


    MyLib.viewSwitcher.setup({
        // Standardizes document content before display.
        standardizeContent: function(documentObject, requestInfo) {

            // Eliminates specific stylesheet and link elements based on a marker.
            var exclusionMarker = 'no_layout';
            var sourceHeader = documentObject.head;
            util.iterateCollection(convertToList(sourceHeader.childNodeList), function(elementNode) {
                switch(PageElements.nodeKind(elementNode)) {
                case "style":
                case "link":
                    var elementLabel = util.toLower(util.stripWhitespace(elementNode.title));
                    if (elementLabel !== exclusionMarker) {
                        return;
                    }
                    break;
                default:
                    return;
                }
                sourceHeader.removeElement(elementNode);
            });

            // Additional content normalization logic would go here.
        },

        // Transition duration for view changes.
        transitionTime: 100,
        // Callbacks for element removal.
        elementRemoved: { before: conceal, after: reveal },
        // Callbacks for element insertion.
        elementAdded: { before: conceal, after: reveal },
        // Callbacks for pages exiting.
        viewExiting: { before: doNothing, after: doNothing },
        // Callbacks for pages entering.
        viewEntering: { before: doNothing, after: doNothing }
    });

    function fetchLayoutSourceUrl(documentObject) {
        var layoutLink = retrieveLayoutLink(documentObject);
        if (!layoutLink) return null; // No layout link found.
        var hyperlinkRef = layoutLink.getAttr("href");
        return basePath.resolvePath(hyperlinkRef); // Resolves the relative path.
    }

    function retrieveLayoutLink(documentObject) {
        var layoutLink, priorityScore = 0;
        util.iterateCollection(queryAll("link", documentObject.head), function(currentElement) {
            var score = 0;
            if (currentElement.elementType !== 1) return; // Skip non-element nodes.

            var mimeType = currentElement.type.toLowerCase();
            if (!/^\s*MYLIB-LAYOUT\s*$/i.checkPattern(currentElement.rel)) return;

            if (mimeType === "application/xhtml+xml" || mimeType === "text/plain") {
                score += 1;
            } else {
                eventLog.reportWarning("Unsupported layout document type: " + mimeType);
                return;
            }

            var mediaQuery = currentElement.getAttr("media");
            if (mediaQuery) {
                if (window.matchMediaQuery && window.matchMediaQuery(mediaQuery).isMatching) {
                    score += 2;
                } else {
                    return; // Layout rejected if media query does not match or is unsupported.
                }
            }

            if (score > priorityScore) {
                priorityScore = score;
                layoutLink = currentElement;
            }
        });
        return layoutLink;
    }

    function conceal(eventData) {
        eventData.node.setAttr("invisible", "invisible");
    }

    function reveal(eventData) {
        eventData.node.removeAttr("invisible");
    }

    function doNothing(eventData) {
        // This function intentionally does nothing.
    }

})();