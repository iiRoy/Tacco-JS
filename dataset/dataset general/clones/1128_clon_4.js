function utilProcessorThrottler(func, delay, immediate) {
    let timerId;
    return function() {
        const context = this, args = arguments;
        const laterCall = function() {
            timerId = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timerId;
        clearTimeout(timerId);
        timerId = setTimeout(laterCall, delay);
        if (callNow) func.apply(context, args);
    };
}

const GlobalSuggestiveInputManager = (function() {
    let activeInputRef = null;
    let activeInputOptions = null;
    let previousInputValue = '';
    let lastConfirmedValue = '';
    let currentSuggestionList = [];
    let currentHighlightIndex = -1;
    let isFetchingSuggestions = false;
    let isDisplayingSuggestions = false;

    let displayHostElement = null;
    let optionListElement = null;

    const systemConfig = {
        displayRefreshInterval: 150,
        connectionDelay: 300,
        suggestionRequestDelay: 200,
        blurDetectionDelay: 150
    };

    let inputEventListeners = {};
    let windowEventListeners = {};

    const KeyboardNavCodes = {
        TAB: 9, ESC: 27, ENTER: 13, UP: 38, DOWN: 40
    };

    const throttledPositionDisplay = utilProcessorThrottler(positionDisplayElement, systemConfig.displayRefreshInterval);
    const throttledFetchSuggestions = utilProcessorThrottler(triggerSuggestionFetch, systemConfig.suggestionRequestDelay);

    function createDisplayElements() {
        if (!displayHostElement) {
            displayHostElement = document.createElement('div');
            displayHostElement.className = 'suggest-panel-host';
            displayHostElement.style.position = 'absolute';
            displayHostElement.style.display = 'none';
            displayHostElement.tabIndex = -1; // Make it focusable but not part of tab order to catch blur

            optionListElement = document.createElement('ul');
            optionListElement.className = 'suggest-menu';
            displayHostElement.appendChild(optionListElement);
            document.body.appendChild(displayHostElement);
        }
    }

    function positionDisplayElement() {
        if (!activeInputRef || !displayHostElement || !isDisplayingSuggestions) return;

        const inputRect = activeInputRef.getBoundingClientRect();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

        displayHostElement.style.top = `${inputRect.top + inputRect.height + scrollY}px`;
        displayHostElement.style.left = `${inputRect.left + scrollX}px`;
        displayHostElement.style.width = `${inputRect.width}px`;
    }

    function updateSuggestionDisplay() {
        if (!optionListElement) return;

        optionListElement.innerHTML = '';

        if (currentSuggestionList.length === 0 || !isDisplayingSuggestions) {
            displayHostElement.style.display = 'none';
            return;
        }

        currentSuggestionList.forEach((item, index) => {
            // Original template uses ng-if="$index > 0", so index 0 (original term) is skipped if other suggestions exist
            if (index === 0 && currentSuggestionList.length > 1) {
                return;
            }

            const listItem = document.createElement('li');
            listItem.className = 'suggest-menu-item';
            if (index === currentHighlightIndex) {
                listItem.classList.add('suggest-state-focus');
            }
            listItem.dataset.index = index;

            const link = document.createElement('a');
            link.href = 'javascript:void(0)';
            link.innerHTML = item.label;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                confirmHighlightedOption(parseInt(e.currentTarget.parentNode.dataset.index, 10));
            });

            listItem.appendChild(link);
            optionListElement.appendChild(listItem);
        });

        displayHostElement.style.display = 'block';
        positionDisplayElement();
    }

    function syncInputDisplayValue(value) {
        if (activeInputRef && activeInputRef.value !== value) {
            activeInputRef.value = value;
        }
    }

    function highlightOption(index) {
        if (!currentSuggestionList.length) return;

        let newIndex = index;
        if (newIndex >= currentSuggestionList.length) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = currentSuggestionList.length - 1;
        }

        const selectedItem = currentSuggestionList[newIndex];
        if (selectedItem) {
            syncInputDisplayValue(selectedItem.value);
            currentHighlightIndex = newIndex;
            updateSuggestionDisplay();
        }
    }

    function confirmHighlightedOption(index) {
        if (!currentSuggestionList.length || index < 0 || index >= currentSuggestionList.length) {
            return;
        }

        const selectedItem = currentSuggestionList[index];
        if (selectedItem) {
            syncInputDisplayValue(selectedItem.value);
            lastConfirmedValue = selectedItem.value;
            isDisplayingSuggestions = false;
            updateSuggestionDisplay();
            activeInputRef.focus();

            activeInputOptions.onSelect && activeInputOptions.onSelect(selectedItem);
        }
    }

    function triggerSuggestionFetch(term, targetElement) {
        if (activeInputRef !== targetElement) return;

        currentHighlightIndex = 0;
        isFetchingSuggestions = true;

        if (typeof term === 'string' && term.length > 0) {
            Promise.resolve(activeInputOptions.suggest(term))
                .then(suggestions => {
                    if (activeInputRef !== targetElement) return;

                    if (suggestions && suggestions.length > 0) {
                        currentSuggestionList = [{ value: term, label: ''}].concat(suggestions);
                        isDisplayingSuggestions = true;
                        if (activeInputOptions.autoSelectFirst) {
                            highlightOption(1);
                        } else {
                            highlightOption(0); // This will highlight the original term if it's rendered, or no item if it's skipped.
                        }
                    } else {
                        currentSuggestionList = [];
                        isDisplayingSuggestions = false;
                    }
                })
                .catch(error => {
                    isDisplayingSuggestions = false;
                    activeInputOptions.onError && activeInputOptions.onError(error);
                })
                .finally(() => {
                    isFetchingSuggestions = false;
                    updateSuggestionDisplay();
                });
        } else {
            isFetchingSuggestions = false;
            isDisplayingSuggestions = false;
            currentSuggestionList = [];
            updateSuggestionDisplay();
        }
    }

    function bindInputEvents() {
        if (!activeInputRef) return;

        inputEventListeners.onInput = (e) => {
            if (activeInputRef.value === lastConfirmedValue) return;

            throttledPositionDisplay();
            throttledFetchSuggestions(activeInputRef.value, activeInputRef);
        };
        activeInputRef.addEventListener('input', inputEventListeners.onInput);

        inputEventListeners.onKeydown = (e) => {
            if (e.shiftKey) return;

            switch (e.keyCode) {
                case KeyboardNavCodes.ESC:
                    if (isDisplayingSuggestions) {
                        isDisplayingSuggestions = false;
                        updateSuggestionDisplay();
                    } else {
                        syncInputDisplayValue(previousInputValue);
                    }
                    break;
                case KeyboardNavCodes.ENTER:
                    // Original only accepts selection if index > 0 (i.e. not the original term)
                    if (isDisplayingSuggestions && currentHighlightIndex > 0 && !isFetchingSuggestions) {
                        confirmHighlightedOption(currentHighlightIndex);
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    isDisplayingSuggestions = false;
                    updateSuggestionDisplay();
                    break;
                case KeyboardNavCodes.TAB:
                    if (!isDisplayingSuggestions) break;
                    e.preventDefault();
                case KeyboardNavCodes.DOWN:
                    if (currentSuggestionList.length > 0) {
                        if (isDisplayingSuggestions) {
                            highlightOption(currentHighlightIndex + 1);
                        } else {
                            isDisplayingSuggestions = true;
                            highlightOption(0);
                        }
                    }
                    break;
                case KeyboardNavCodes.UP:
                    if (isDisplayingSuggestions) {
                        e.preventDefault();
                        highlightOption(currentHighlightIndex - 1);
                    }
                    break;
            }
        };
        activeInputRef.addEventListener('keydown', inputEventListeners.onKeydown);

        inputEventListeners.onBlur = () => {
            setTimeout(() => {
                // Check if focus is still on the input, or if it moved to the autocomplete panel itself
                if (document.activeElement !== activeInputRef && !displayHostElement.contains(document.activeElement)) {
                    publicAPI.deactivate();
                }
            }, systemConfig.blurDetectionDelay);
        };
        activeInputRef.addEventListener('blur', inputEventListeners.onBlur);

        windowEventListeners.onResize = throttledPositionDisplay;
        window.addEventListener('resize', windowEventListeners.onResize);
    }

    function unbindInputEvents() {
        if (activeInputRef) {
            activeInputRef.removeEventListener('input', inputEventListeners.onInput);
            activeInputRef.removeEventListener('keydown', inputEventListeners.onKeydown);
            activeInputRef.removeEventListener('blur', inputEventListeners.onBlur);
            inputEventListeners = {};
        }
        window.removeEventListener('resize', windowEventListeners.onResize);
        windowEventListeners = {};
    }

    const publicAPI = {
        initialize: utilProcessorThrottler(function(targetElement, configOptions) {
            if (activeInputRef === targetElement) return;
            if (activeInputRef) publicAPI.deactivate();
            if (targetElement !== document.activeElement) return;

            activeInputRef = targetElement;
            activeInputOptions = configOptions;
            previousInputValue = targetElement.value;
            lastConfirmedValue = '';
            currentSuggestionList = [];
            currentHighlightIndex = -1;
            isDisplayingSuggestions = false;

            createDisplayElements();
            bindInputEvents();

            activeInputRef.setAttribute('autocomplete', 'off');

            activeInputOptions.onConnect && activeInputOptions.onConnect();
        }, systemConfig.connectionDelay),

        deactivate: function() {
            if (activeInputRef) {
                const finalValue = activeInputRef.value;
                syncInputDisplayValue(finalValue);
                activeInputOptions.onDisconnect && activeInputOptions.onDisconnect(finalValue);
                unbindInputEvents();
            }

            isDisplayingSuggestions = false;
            isFetchingSuggestions = false;
            currentSuggestionList = [];
            currentHighlightIndex = -1;
            activeInputRef = null;
            activeInputOptions = null;
            previousInputValue = '';
            lastConfirmedValue = '';

            updateSuggestionDisplay();
        },

        destroy: function() {
            publicAPI.deactivate();
            if (displayHostElement && displayHostElement.parentNode) {
                displayHostElement.parentNode.removeChild(displayHostElement);
                displayHostElement = null;
                optionListElement = null;
            }
        }
    };

    return publicAPI;
})();

// Example of how it would be used, to match the original's directive structure:
// This part is NOT the clone itself, but demonstrates the usage.
//
// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelectorAll('[data-suggest-target]').forEach(inputElement => {
//         inputElement.addEventListener('focus', function() {
//             // This mimics the 'massAutocompleteItem' directive's link function
//             // where it evaluates the attribute value to get options.
//             // In a real-world scenario, you would pass a proper object directly.
//             const optionsString = this.getAttribute('data-suggest-target');
//             // WARNING: eval is dangerous. For demonstration, assuming safe input.
//             const options = eval(`(${optionsString})`);
//             GlobalSuggestiveInputManager.initialize(this, options);
//         });
//     });
//
//     // For cleanup when the page might be navigated away or complex SPAs
//     window.addEventListener('beforeunload', () => {
//         GlobalSuggestiveInputManager.destroy();
//     });
// });