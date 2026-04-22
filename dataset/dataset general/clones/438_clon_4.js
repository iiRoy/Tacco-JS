var DOMELEMENT_FINDER = function (inputString) {
    var intermediateResult;
    var segmentList;
    var currentSegment;
    var parentScope;

    var modifiedInput = inputString;
    if (modifiedInput.indexOf('~') > 0) {
        var partsByTilde = modifiedInput.split('~');
        modifiedInput = '~' + partsByTilde[partsByTilde.length - 1];
    }
    segmentList = modifiedInput.split(' ');

    intermediateResult = document;

    var segmentProcessor = {
        obtainById: function (idValue) {
            return document.getElementById(idValue);
        },

        retrieveElements: function (criteriaType, selectionValue, parentContexts) {
            var collection = [];
            var queryFormula = '';

            if (criteriaType === 'class') {
                queryFormula = '.' + selectionValue;
            } else if (criteriaType === 'tag') {
                queryFormula = selectionValue;
            } else {
                return []; // Unknown criteria, return empty
            }

            var processSingleParent = function(individualParent) {
                if (individualParent && typeof individualParent.querySelectorAll === 'function') {
                    collection = collection.concat(Array.from(individualParent.querySelectorAll(queryFormula)));
                }
            };

            if (parentContexts instanceof NodeList || Array.isArray(parentContexts) || (parentContexts && typeof parentContexts.length === 'number')) {
                Array.prototype.forEach.call(parentContexts, processSingleParent);
            } else if (parentContexts && typeof parentContexts.querySelectorAll === 'function') {
                processSingleParent(parentContexts);
            }

            return (collection.length === 1) ? collection[0] : collection;
        }
    };

    for (var k = 0; k < segmentList.length; k++) {
        currentSegment = segmentList[k];
        parentScope = intermediateResult;

        if (currentSegment.indexOf('~') === 0) {
            intermediateResult = segmentProcessor.obtainById(currentSegment.substring(1));
        } else if (currentSegment.indexOf('.') > -1) {
            var subParts = currentSegment.split('.');
            var tagIdentifier = subParts[0];
            var classIdentifier = subParts[1];

            if (tagIdentifier) {
                var initialCandidates = segmentProcessor.retrieveElements('tag', tagIdentifier, parentScope);
                var validElements = [];

                var filterByClassName = function(item) {
                    if (item && item.className && item.className.indexOf(classIdentifier) > -1) {
                        validElements.push(item);
                    }
                };

                if (initialCandidates && typeof initialCandidates.length === 'number') {
                    Array.prototype.forEach.call(initialCandidates, filterByClassName);
                } else if (initialCandidates) {
                    filterByClassName(initialCandidates);
                }
                intermediateResult = (validElements.length === 1) ? validElements[0] : validElements;

            } else {
                intermediateResult = segmentProcessor.retrieveElements('class', classIdentifier, parentScope);
            }
        } else {
            intermediateResult = segmentProcessor.retrieveElements('tag', currentSegment, parentScope);
        }
    }

    return intermediateResult;
};