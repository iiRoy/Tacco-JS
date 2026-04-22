(function (jq) {
    if (typeof jq.fn.iterateElements === "undefined") {
        jq.fn.extend({
            iterateElements: function (processItemCallback) {
                let currentElementJqWrap = jq([]);
                let currentIdx = -1;
                const collectionLen = this.length;
                while (++currentIdx < collectionLen) {
                    const rawDOMElement = this[currentIdx];
                    currentElementJqWrap[0] = rawDOMElement;
                    // The original passes j[0] as `this` and j as the second argument.
                    if (processItemCallback.call(rawDOMElement, currentIdx, currentElementJqWrap) === false) {
                        break;
                    }
                }
                return this;
            }
        });
    }
})(jQuery);

(function (jq, undef) {
    "use strict";

    if (window.CustomDropdownLibrary !== undef) {
        return;
    }

    const KeyboardInputCodes = (() => {
        const codeMap = new Map([
            ['TAB_KEY', 9], ['ENTER_KEY', 13], ['ESCAPE_KEY', 27], ['SPACE_KEY', 32],
            ['LEFT_ARROW', 37], ['UP_ARROW', 38], ['RIGHT_ARROW', 39], ['DOWN_ARROW', 40],
            ['SHIFT_KEY', 16], ['CONTROL_KEY', 17], ['ALT_KEY', 18],
            ['PAGE_UP_KEY', 33], ['PAGE_DOWN_KEY', 34], ['HOME_KEY', 36], ['END_KEY', 35],
            ['BACKSPACE_KEY', 8], ['DELETE_KEY', 46]
        ]);

        const arrowKeys = new Set([codeMap.get('LEFT_ARROW'), codeMap.get('RIGHT_ARROW'), codeMap.get('UP_ARROW'), codeMap.get('DOWN_ARROW')]);
        const controlKeys = new Set([codeMap.get('SHIFT_KEY'), codeMap.get('CONTROL_KEY'), codeMap.get('ALT_KEY')]);

        return {
            isDirectional: (inputEvent) => arrowKeys.has(inputEvent.which || inputEvent),
            isModifier: (inputEvent) => controlKeys.has(inputEvent.which || inputEvent) || inputEvent.metaKey,
            isFunctionKeyRange: (keyCode) => {
                const k = keyCode.which || keyCode;
                return k >= 112 && k <= 123;
            },
            getCode: (keyName) => codeMap.get(keyName)
        };
    })();

    let uniqueIdentifierCounter = 1;
    const generateUniqueId = () => uniqueIdentifierCounter++;

    const sanitizeTextContent = (inputStr) => {
        if (!(inputStr && typeof inputStr === "string")) {
            return inputStr;
        }
        let processedChars = [];
        for (let i = 0; i < inputStr.length; i++) {
            const char = inputStr[i];
            if (char === '&') {
                processedChars.push('&amp;');
            } else {
                processedChars.push(char);
            }
        }
        return processedChars.join('');
    };

    const compareValues = (firstOperand, secondOperand) => {
        if (firstOperand === secondOperand) return true;
        if (firstOperand == null || secondOperand == null) return false;
        if (typeof firstOperand === 'string') return firstOperand.localeCompare(secondOperand) === 0;
        if (typeof secondOperand === 'string') return secondOperand.localeCompare(firstOperand) === 0;
        return false;
    };

    const findItemPosition = (itemToFind, itemCollection) => {
        if (itemToFind === undef) {
            return -1;
        }
        // Ensure itemCollection is an array for findIndex
        const collectionAsArray = Array.isArray(itemCollection) ? itemCollection : Array.from(itemCollection);
        return collectionAsArray.findIndex(currentItem => compareValues(itemToFind, currentItem));
    };

    const segmentStringParts = (inputString, partSeparator) => {
        if (inputString === null || inputString.length < 1) return [];
        return inputString.split(partSeparator).map(s => jq.trim(s));
    };

    const calculateElementFrame = (targetElement) => {
        // Assuming targetElement is a jQuery object
        return targetElement.outerWidth() - targetElement.width();
    };

    const elementPreviousValueStorage = new WeakMap();
    const setupInputChangeListener = (targetElement) => {
        targetElement.on("keydown", function () {
            if (!elementPreviousValueStorage.has(this)) {
                elementPreviousValueStorage.set(this, jq(this).val());
            }
        });
        targetElement.on("keyup", function () {
            const previousVal = elementPreviousValueStorage.get(this);
            const currentVal = jq(this).val();
            if (previousVal !== undef && currentVal !== previousVal) {
                elementPreviousValueStorage.delete(this);
                jq(this).trigger("change-on-keyup");
            }
        });
    };

    let lastPointerCoordinates = null;
    document.addEventListener("mousemove", (evt) => {
        lastPointerCoordinates = { x: evt.pageX, y: evt.pageY };
    }, true);

    const activateFilteredPointerMovement = (targetElement) => {
        targetElement.on("mousemove", function (evt) {
            const currentX = evt.pageX;
            const currentY = evt.pageY;
            if (!lastPointerCoordinates || lastPointerCoordinates.x !== currentX || lastPointerCoordinates.y !== currentY) {
                jq(evt.target).trigger("pointer-move-filtered", evt);
            }
        });
    };

    const throttleFunctionCall = (delayMilliseconds, funcToThrottle) => {
        let timerHandle;
        return function (...args) {
            window.clearTimeout(timerHandle);
            timerHandle = window.setTimeout(() => funcToThrottle.apply(this, args), delayMilliseconds);
        };
    };

    const createLazyEvaluator = (computationFunction) => {
        let evaluatedFlag = false;
        let cachedResult;
        return () => {
            if (!evaluatedFlag) {
                cachedResult = computationFunction();
                evaluatedFlag = true;
            }
            return cachedResult;
        };
    };

    const setupThrottledScrollHandler = (debounceThreshold, targetElement) => {
        const notifyScroll = throttleFunctionCall(debounceThreshold, (evt) => {
            targetElement.trigger("scroll-throttled", evt);
        });
        targetElement.on("scroll", function (evt) {
            if (findItemPosition(evt.target, targetElement.get()) >= 0) {
                notifyScroll(evt);
            }
        });
    };

    const preventEventPropagation = (eventObject) => {
        eventObject.preventDefault();
        eventObject.stopPropagation();
    };

    let textWidthHelperDiv = null;
    const determineTextDisplayWidth = (inputElement) => {
        if (!textWidthHelperDiv) {
            const elementStyle = inputElement[0].currentStyle || window.getComputedStyle(inputElement[0], null);
            textWidthHelperDiv = document.createElement("div");
            Object.assign(textWidthHelperDiv.style, {
                position: "absolute",
                left: "-10000px",
                top: "-10000px",
                display: "none",
                fontSize: elementStyle.fontSize,
                fontFamily: elementStyle.fontFamily,
                fontStyle: elementStyle.fontStyle,
                fontWeight: elementStyle.fontWeight,
                letterSpacing: elementStyle.letterSpacing,
                textTransform: elementStyle.textTransform,
                whiteSpace: "nowrap"
            });
            document.body.appendChild(textWidthHelperDiv);
        }
        textWidthHelperDiv.textContent = inputElement.val();
        return textWidthHelperDiv.offsetWidth;
    };

    const highlightSearchTerm = (fullText, searchKey, outputMarkupArray) => {
        const matchIndex = fullText.toUpperCase().indexOf(searchKey.toUpperCase());
        const keyLength = searchKey.length;

        if (matchIndex < 0) {
            outputMarkupArray.push(fullText);
            return;
        }

        outputMarkupArray.push(fullText.substring(0, matchIndex));
        outputMarkupArray.push("<span class='highlighted-match'>");
        outputMarkupArray.push(fullText.substring(matchIndex, matchIndex + keyLength));
        outputMarkupArray.push("</span>");
        outputMarkupArray.push(fullText.substring(matchIndex + keyLength, fullText.length));
    };

    const remoteDataSource = (fetchOptions) => {
        let debounceTimer,
            requestCount = 0,
            currentAbortController = null,
            delayMillis = fetchOptions.quietMillis || 100;

        return function (queryRequest) {
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(async () => {
                requestCount += 1;
                const currentRequestNumber = requestCount;
                const dataExtractor = fetchOptions.data;
                const useTraditional = fetchOptions.traditional || false;
                const requestMethod = fetchOptions.type || 'GET';
                const resultProcessor = fetchOptions.results;

                const requestPayload = dataExtractor.call(this, queryRequest.term, queryRequest.page, queryRequest.context);

                if (currentAbortController) {
                    currentAbortController.abort();
                }
                currentAbortController = new AbortController();
                const { signal } = currentAbortController;

                try {
                    const url = new URL(fetchOptions.url);
                    let body = null;
                    let headers = { 'Content-Type': 'application/json' };

                    if (requestMethod.toUpperCase() === 'GET') {
                        Object.keys(requestPayload).forEach(key => url.searchParams.append(key, requestPayload[key]));
                    } else {
                        if (useTraditional) { // Mimic jQuery's traditional serialization for POST
                           body = Object.keys(requestPayload).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(requestPayload[key])}`).join('&');
                           headers['Content-Type'] = 'application/x-www-form-urlencoded';
                        } else {
                            body = JSON.stringify(requestPayload);
                        }
                    }

                    const response = await fetch(url.toString(), {
                        method: requestMethod,
                        headers: headers,
                        body: body,
                        signal: signal
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const responseData = fetchOptions.dataType === 'json' ? await response.json() : await response.text();

                    if (currentRequestNumber < requestCount) {
                        return;
                    }
                    const processedResults = resultProcessor(responseData, queryRequest.page);
                    queryRequest.callback(processedResults);
                } catch (error) {
                    if (error.name === 'AbortError') {
                        // Request was aborted, ignore.
                    } else {
                        console.error('Data fetch error:', error);
                        queryRequest.callback({ results: [] }); // Call callback with empty results on error
                    }
                } finally {
                    currentAbortController = null; // Clear controller after request completion or abort
                }
            }, delayMillis);
        };
    };

    const localDataSource = (configObject) => {
        let sourceData = configObject;
        let textAccessor = (item) => "" + item.text;

        if (!jq.isArray(sourceData)) {
            textAccessor = sourceData.text;
            if (!jq.isFunction(textAccessor)) {
                const textPropertyKey = sourceData.text;
                textAccessor = (item) => item[textPropertyKey];
            }
            sourceData = sourceData.results;
        }

        return (searchQuery) => {
            const searchString = searchQuery.term;
            let filteredResults = { results: [] };
            if (searchString === "") {
                searchQuery.callback({ results: sourceData });
                return;
            }
            filteredResults.results = Array.from(sourceData)
                .filter(item => searchQuery.matcher(searchString, textAccessor(item)));
            searchQuery.callback(filteredResults);
        };
    };

    const taggingDataSource = (sourceData) => {
        if (jq.isFunction(sourceData)) {
            return sourceData;
        }

        return (searchQuery) => {
            const searchString = searchQuery.term;
            const collectedResults = { results: [] };

            Array.from(sourceData).forEach(item => {
                const isItemObject = item && typeof item === 'object' && item.text !== undef;
                const itemText = isItemObject ? item.text : item;
                if (searchString === "" || searchQuery.matcher(searchString, itemText)) {
                    collectedResults.results.push(isItemObject ? item : { id: item, text: item });
                }
            });
            searchQuery.callback(collectedResults);
        };
    };

    const validateDisplayFormatter = (formatterFunction, formatterName) => {
        if (typeof formatterFunction === 'function') return true;
        if (!formatterFunction) return false;
        throw new Error(`${formatterName} must be a function or a falsy value`);
    };

    const resolveValueOrFunction = (inputVal) => {
        return typeof inputVal === 'function' ? inputVal() : inputVal;
    };

    const countNestedItems = (itemsCollection) => {
        let totalCount = 0;
        const processStack = [...itemsCollection]; // Use a stack for iterative traversal

        while (processStack.length > 0) {
            const currentItem = processStack.shift(); // Use shift to process in order, or pop for LIFO
            if (currentItem && currentItem.children) {
                processStack.unshift(...currentItem.children); // Add children to the front for depth-first-like processing
            } else {
                totalCount++;
            }
        }
        return totalCount;
    };

    const parseInputTokens = (currentInputText, currentSelection, addChoiceCallback, processingOptions) => {
        const initialInput = currentInputText;
        let hasDuplicate = false;

        if (!processingOptions.createSearchChoice || !processingOptions.tokenSeparators || processingOptions.tokenSeparators.length < 1) {
            return undef;
        }

        const separatorPattern = new RegExp(processingOptions.tokenSeparators.map(s => jq.escapeSelector(s)).join('|'), 'g'); // Escape separators for regex
        let lastIndex = 0;
        let match;

        while ((match = separatorPattern.exec(currentInputText)) !== null) {
            const tokenValue = currentInputText.substring(lastIndex, match.index);
            lastIndex = match.index + match[0].length;

            if (tokenValue.length > 0) {
                const newChoice = processingOptions.createSearchChoice(tokenValue, currentSelection);
                if (newChoice !== undef && newChoice !== null && processingOptions.id(newChoice) !== undef && processingOptions.id(newChoice) !== null) {
                    hasDuplicate = false;
                    for (let i = 0; i < currentSelection.length; i++) {
                        if (compareValues(processingOptions.id(newChoice), processingOptions.id(currentSelection[i]))) {
                            hasDuplicate = true;
                            break;
                        }
                    }
                    if (!hasDuplicate) addChoiceCallback(newChoice);
                }
            }
        }

        const remainingInput = currentInputText.substring(lastIndex);
        if (initialInput.localeCompare(remainingInput) !== 0) {
            return remainingInput;
        }
    };

    const activeDropdownInstancesMap = new WeakMap(); // Maps original input element to dropdown instance
    const registeredCustomContainers = new Set(); // Stores DOM nodes of active containers
    const registeredCustomPanels = new Set(); // Stores DOM nodes of active panels

    // This function would be called by the CustomDropdownLibrary instance when it activates/deactivates
    const registerDropdownState = (instance, containerNode, panelNode, originalInputNode, isActive) => {
        if (originalInputNode) {
            if (isActive) activeDropdownInstancesMap.set(originalInputNode, instance);
            else activeDropdownInstancesMap.delete(originalInputNode);
        }
        if (containerNode) {
            if (isActive) registeredCustomContainers.add(containerNode);
            else registeredCustomContainers.delete(containerNode);
        }
        if (panelNode) {
            if (isActive) registeredCustomPanels.add(panelNode);
            else registeredCustomPanels.delete(panelNode);
        }
    };

    document.addEventListener("mousedown", handleDocumentInteraction, true);
    document.addEventListener("touchend", handleDocumentInteraction, true);

    function handleDocumentInteraction(evt) {
        const interactionTarget = evt.target;
        const clickedContainer = interactionTarget.closest("div.custom-dropdown-container");
        const clickedPanel = interactionTarget.closest("div.custom-dropdown-panel");

        if (clickedContainer) {
            registeredCustomContainers.forEach(containerNode => {
                if (containerNode !== clickedContainer) {
                    const associatedInput = containerNode.previousElementSibling; // Assuming structure: input -> container
                    const instance = activeDropdownInstancesMap.get(associatedInput);
                    if (instance && typeof instance.deactivateFocus === 'function') instance.deactivateFocus();
                }
            });
        } else if (clickedPanel) {
            registeredCustomPanels.forEach(panelNode => {
                if (panelNode !== clickedPanel) {
                    const associatedInput = panelNode.previousElementSibling; // Assuming structure: input -> panel
                    const instance = activeDropdownInstancesMap.get(associatedInput);
                    if (instance && typeof instance.deactivateFocus === 'function') instance.deactivateFocus();
                }
            });
        } else {
            // Clicked outside any known dropdown component. Deactivate all.
            registeredCustomContainers.forEach(containerNode => {
                const associatedInput = containerNode.previousElementSibling;
                const instance = activeDropdownInstancesMap.get(associatedInput);
                if (instance && typeof instance.deactivateFocus === 'function') instance.deactivateFocus();
            });
        }

        if (interactionTarget.tagName === "LABEL") {
            const htmlForAttr = interactionTarget.getAttribute("for");
            if (htmlForAttr && htmlForAttr.length > 0) {
                const associatedInput = document.getElementById(htmlForAttr);
                if (associatedInput) {
                    const linkedDropdown = activeDropdownInstancesMap.get(associatedInput);
                    if (linkedDropdown && typeof linkedDropdown.activateFocus === 'function') {
                        linkedDropdown.activateFocus();
                        preventEventPropagation(evt);
                    }
                }
            }
        }
    }

    // Export the cloned utilities
    window.CustomDropdownLibrary = {
        KeyboardInputCodes: KeyboardInputCodes,
        generateUniqueId: generateUniqueId,
        sanitizeTextContent: sanitizeTextContent,
        findItemPosition: findItemPosition,
        compareValues: compareValues,
        segmentStringParts: segmentStringParts,
        calculateElementFrame: calculateElementFrame,
        setupInputChangeListener: setupInputChangeListener,
        activateFilteredPointerMovement: activateFilteredPointerMovement,
        throttleFunctionCall: throttleFunctionCall,
        createLazyEvaluator: createLazyEvaluator,
        setupThrottledScrollHandler: setupThrottledScrollHandler,
        preventEventPropagation: preventEventPropagation,
        determineTextDisplayWidth: determineTextDisplayWidth,
        highlightSearchTerm: highlightSearchTerm,
        remoteDataSource: remoteDataSource,
        localDataSource: localDataSource,
        taggingDataSource: taggingDataSource,
        validateDisplayFormatter: validateDisplayFormatter,
        resolveValueOrFunction: resolveValueOrFunction,
        countNestedItems: countNestedItems,
        parseInputTokens: parseInputTokens,

        // Internal methods for the main library to manage its state for global event handlers
        _registerDropdownState: registerDropdownState
    };

})(jQuery, undefined);