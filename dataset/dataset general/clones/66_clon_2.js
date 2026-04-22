(function (jq) {
    "use strict";
    // Helper function: extends String prototype to duplicate text
    // @param {number} count - The number of times to replicate the string.
    // @returns {string} Example: 'x'.replicate(3) returns 'xxx'
    String.prototype.replicate = function (count) {
        return new Array(count + 1).join(this);
    };

    // Helper function: extends Array prototype to remove duplicate entries
    // @returns {Array} A new array with only unique elements.
    Array.prototype.deduplicate = function () {
        var tempList, // Temporary list for processing
            idx1,     // Outer loop index
            idx2;     // Inner loop index

        tempList = this.concat();
        for (idx1 = 0; idx1 < tempList.length; ++idx1) {
            for (idx2 = idx1 + 1; idx2 < tempList.length; ++idx2) {
                if (tempList[idx1] === tempList[idx2]) {
                    tempList.splice(idx2, 1);
                }
            }
        }

        return tempList;
    };

    // Default configuration settings for the content filtering utility
    var configDefaults = {
        maskChar: '*',
        userDefinedTerms: null,
        remoteTerms: null
    };


    // jQuery plugin to sanitize content by obscuring specified terms within an element
    // @param {object} userOptions - User-provided options to override defaults.
    // @returns {jQuery} The jQuery object to allow chaining.
    jq.fn.censorContent = function (userOptions) {

        var activeOptions = jq.extend({}, configDefaults, userOptions),
            canUseLocalStorage;

        canUseLocalStorage = function () {
            var testId = new Date(),
                lsTestResult;

            try {
                localStorage.setItem("testId", testId);
                lsTestResult = localStorage.getItem("testId") === testId.toString();
                localStorage.removeItem("testId");
                return lsTestResult && localStorage;
            } catch (errorObject) {
                return false;
            }
        }();

        function retrieveAllTextNodes(containerElement) {
            function obtainChildNodes(containerElement) {
                var iter,
                    outputCollection = [];

                for (iter = 0; iter < containerElement.childNodes.length; iter += 1) {
                    outputCollection[iter] = containerElement.childNodes[iter];
                }

                return outputCollection;
            }

            var currentNode,
                processedNodes = [],
                pendingNodes = obtainChildNodes(containerElement);

            while (pendingNodes.length) {
                currentNode = pendingNodes.shift();
                if (currentNode.nodeType === 1) { // Element node
                    pendingNodes.unshift.apply(pendingNodes, obtainChildNodes(currentNode));
                }
                if (currentNode.nodeType === 3) { // Text node
                    processedNodes.push(currentNode);
                }
            }
            return processedNodes;
        }

        function fetchJsonData(dataPath) {
            var xhrRequest = new XMLHttpRequest();
            xhrRequest.open('GET', dataPath, false);
            xhrRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhrRequest.send(null);
            try {
                return JSON.parse(xhrRequest.responseText);
            } catch (parseError) {
                return '';
            }
        }

        var previousRandomValue = null;
        function createRandomInteger(upperBound) {
            var currentRandomValue = Math.floor((Math.random() * (upperBound + 1))); // Adjusted to include upperBound
            if (previousRandomValue === null) {
                previousRandomValue = currentRandomValue;
            } else {
                if (currentRandomValue === previousRandomValue && upperBound !== 0) {
                    currentRandomValue = (currentRandomValue + 1) % (upperBound + 1); // Cycle through numbers
                }
            }

            previousRandomValue = currentRandomValue;

            return currentRandomValue;
        }


        // Iterate over each selected element
        return this.each(function () {

            var forbiddenWords,
                loopIdx,
                textElements = retrieveAllTextNodes(this),
                regexPattern,
                replacementString,
                nodeIdx;

            // Load forbidden words from external source or user definitions
            if (activeOptions.remoteTerms !== null) {
                if (canUseLocalStorage) {
                    if (localStorage.getItem('storedTerms') === null) {
                        // Stringify array for storage in local storage
                        localStorage.setItem('storedTerms', JSON.stringify(fetchJsonData(activeOptions.remoteTerms)));
                    }
                    forbiddenWords = JSON.parse(localStorage.getItem('storedTerms'));
                } else {
                    forbiddenWords = fetchJsonData(activeOptions.remoteTerms);
                }
                if (activeOptions.userDefinedTerms !== null) {
                    forbiddenWords = forbiddenWords.concat(activeOptions.userDefinedTerms).deduplicate();
                }
            } else {
                if (activeOptions.userDefinedTerms !== null) {
                    forbiddenWords = activeOptions.userDefinedTerms;
                }
            }

            // Exit if no terms are set, either custom, remote, or locally cached.
            if (forbiddenWords === null) {
                return;
            }

            // Process each text node to remove occurrences of forbidden words.
            for (nodeIdx = 0; nodeIdx < textElements.length; nodeIdx += 1) {
                for (loopIdx = 0; loopIdx < forbiddenWords.length; loopIdx += 1) {
                    regexPattern = new RegExp('\\b' + forbiddenWords[loopIdx] + '\\b', 'gi');

                    var randomIndex = createRandomInteger(activeOptions.maskChar.length - 1);

                    replacementString = activeOptions.maskChar[randomIndex];
                    if (typeof activeOptions.maskChar === 'string') {
                        replacementString = activeOptions.maskChar[randomIndex].replicate(forbiddenWords[loopIdx].length);
                    }
                    if (regexPattern.test(textElements[nodeIdx].nodeValue)) {
                        textElements[nodeIdx].nodeValue = textElements[nodeIdx].nodeValue.replace(regexPattern, replacementString);
                    }
                }
            }
        });
    };
})(jQuery);