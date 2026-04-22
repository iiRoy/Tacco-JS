class EventBroadcaster {
    constructor() {
        this.subscribers = {};
    }
    register(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);
    }
    signal(eventName, ...args) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach(callback => callback(...args));
        }
    }
}

function delayExecution(operation, duration) {
    let timerHandle;
    return function(...args) {
        clearTimeout(timerHandle);
        timerHandle = setTimeout(() => operation.apply(this, args), duration);
    };
}

function evaluateScopedExpression(contextualScope, pathExpression) {
    if (!pathExpression) return undefined;
    
    // Direct variable lookup (e.g., 'item', 'key', 'value')
    if (contextualScope.hasOwnProperty(pathExpression)) {
        return contextualScope[pathExpression];
    }

    // Path traversal (e.g., 'item.name', 'value.id')
    const pathSegments = pathExpression.split('.');
    let currentSegment = pathSegments[0];
    let currentObject = contextualScope[currentSegment];

    if (currentObject === undefined || currentObject === null) {
        return undefined;
    }

    for (let i = 1; i < pathSegments.length; i++) {
        if (currentObject === undefined || currentObject === null) return undefined;
        currentObject = currentObject[pathSegments[i]];
    }
    return currentObject;
}

class EnhancedSelector {
    constructor(targetElement, configOptions) {
        this.sourceElement = targetElement;
        this.configuration = {
            displayPlaceholder: 'Choose...',
            listEmptyMessage: 'No items available',
            noSearchResultsMessage: 'No matches for "$0"',
            addEntryCaption: 'Add New',
            searchDelayDuration: 1000,
            onValueUpdate: null,
            onSearchTrigger: null,
            onEntryAdd: null,
            ...configOptions
        };

        this.currentSelectionValue = null;
        this.displayedText = this.configuration.displayPlaceholder;
        this.rawDataCollection = [];
        this.visibleDataCollection = [];
        this.optionParsingDetails = {};
        this.isPanelVisible = false;
        this.activeOptionIndex = -1;
        this.lastSearchString = '';
        this.currentSearchInput = '';

        this.eventHub = new EventBroadcaster();

        this.interpretOptionString(this.sourceElement.getAttribute('ng-options'));

        this.constructUserInterface();
        this.attachInteractionListeners();

        this.updateDisplayLabel();
    }

    interpretOptionString(attributeString) {
        const OPTION_FORMAT_REGEX = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/;
        const matchedGroups = attributeString.match(OPTION_FORMAT_REGEX);

        if (!matchedGroups) {
            throw new Error("Invalid options string. Expected format: '_display_ (as _value_)? for (_key_,)?_item_ in _collection_'.");
        }

        const loopItemName = matchedGroups[4] || matchedGroups[6];
        const loopKeyName = matchedGroups[5];
        const collectionAccessor = matchedGroups[7];

        const labelAccessor = matchedGroups[2] || matchedGroups[1];
        const valueAccessor = matchedGroups[2] ? matchedGroups[1] : loopItemName;
        const groupAccessor = matchedGroups[3];

        this.optionParsingDetails = {
            loopItemName,
            loopKeyName,
            collectionAccessor,
            valueAccessor,
            labelAccessor,
            groupAccessor
        };
    }

    // Public method to update the data source for the selector
    supplyData(newSourceData) {
        const { loopKeyName } = this.optionParsingDetails;

        if (loopKeyName) { // Handles `(key, value) in objectCollection`
            if (typeof newSourceData !== 'object' || Array.isArray(newSourceData)) {
                console.warn('EnhancedSelector: Expected an object collection for (key, value) options, but received an array or primitive. Data ignored.');
                this.rawDataCollection = [];
            } else {
                this.rawDataCollection = Object.entries(newSourceData).map(([key, value]) => ({ key, value }));
            }
        } else { // Handles `item in arrayCollection`
            if (!Array.isArray(newSourceData)) {
                console.warn('EnhancedSelector: Expected an array collection for item in options, but received an object or primitive. Data ignored.');
                this.rawDataCollection = [];
            } else {
                this.rawDataCollection = newSourceData;
            }
        }
        this.renderOptionList(this.rawDataCollection);
        if (this.currentSelectionValue !== null) {
            this.setSelectorValue(this.currentSelectionValue);
        }
    }

    // Public method to set the selector's value programmatically
    setSelectorValue(newValue) {
        this.currentSelectionValue = newValue;
        this.updateDisplayLabel();
        
        // Emit a custom 'change' event on the original element to mimic ng-model behavior
        const selectionEvent = new CustomEvent('change', { detail: newValue, bubbles: true });
        this.sourceElement.dispatchEvent(selectionEvent);
    }

    constructUserInterface() {
        this.sourceElement.style.display = 'none'; // Hide the original element

        this.outerContainer = document.createElement('div');
        this.outerContainer.className = 'enhanced-selector-container';

        this.displayFacet = document.createElement('a');
        this.displayFacet.className = 'selector-face-toggle';
        this.displayFacet.setAttribute('href', '#');
        this.displayFacet.setAttribute('tabindex', '0');
        this.labelSpan = document.createElement('span');
        this.displayFacet.appendChild(this.labelSpan);
        this.displayFacet.insertAdjacentHTML('beforeend', '<b></b>');

        this.panelOverlay = document.createElement('div');
        this.panelOverlay.className = 'selector-panel-overlay hidden';

        this.searchFieldWrapper = document.createElement('div');
        this.searchFieldWrapper.className = 'selector-search-area';
        this.searchTextInput = document.createElement('input');
        this.searchTextInput.setAttribute('type', 'text');
        this.searchTextInput.setAttribute('autocomplete', 'off');
        this.searchTextInput.className = 'selector-search-input ' + (this.sourceElement.getAttribute('select-class') || '');
        this.searchFieldWrapper.appendChild(this.searchTextInput);

        this.optionDisplayList = document.createElement('ul');
        this.optionDisplayList.setAttribute('role', 'menu');
        this.optionDisplayList.className = 'selector-option-list';

        this.feedbackMessageItem = document.createElement('li');
        this.feedbackMessageItem.className = 'empty-feedback-item hidden';
        this.feedbackMessageItem.setAttribute('role', 'presentation');
        this.feedbackMessageItem.innerHTML = `<em class="muted"><span class="no-search-query">${this.configuration.listEmptyMessage}</span><span class="has-search-query hidden">${this.configuration.noSearchResultsMessage.replace('$0', `<span class="query-highlight"></span>`)}</span></em>`;

        this.optionDisplayList.appendChild(this.feedbackMessageItem);

        this.actionButtonArea = document.createElement('div');
        this.actionButtonArea.className = 'selector-action-zone';
        if (typeof this.configuration.onEntryAdd === 'function') {
            this.addActionButton = document.createElement('button');
            this.addActionButton.setAttribute('type', 'button');
            this.addActionButton.className = 'action-button primary-action-button';
            this.addActionButton.textContent = this.configuration.addEntryCaption;
            this.actionButtonArea.appendChild(this.addActionButton);
        }

        this.panelOverlay.appendChild(this.searchFieldWrapper);
        this.panelOverlay.appendChild(this.optionDisplayList);
        this.panelOverlay.appendChild(this.actionButtonArea);

        this.outerContainer.appendChild(this.displayFacet);
        this.outerContainer.appendChild(this.panelOverlay);

        this.sourceElement.parentNode.insertBefore(this.outerContainer, this.sourceElement.nextSibling);

        this.queryHighlightSpan = this.feedbackMessageItem.querySelector('.query-highlight');
        this.noSearchQuerySpan = this.feedbackMessageItem.querySelector('.no-search-query');
        this.hasSearchQuerySpan = this.feedbackMessageItem.querySelector('.has-search-query');
    }

    attachInteractionListeners() {
        this.displayFacet.addEventListener('click', (event) => {
            event.preventDefault();
            if (this.sourceElement.hasAttribute('disabled')) return;
            this.togglePanelVisibility();
        });

        this.displayFacet.addEventListener('keypress', (event) => {
            if (!(event.altKey || event.ctrlKey)) {
                this.togglePanelVisibility();
            }
        });

        this.searchTextInput.addEventListener('keydown', (event) => {
            if (![13, 27, 40, 9].includes(event.keyCode)) return; // Enter, Esc, Down, Tab
            event.preventDefault();
            event.stopPropagation();

            switch (event.keyCode) {
                case 27: // Esc
                    this.hidePanel();
                    break;
                case 13: // Enter
                    this.chooseFirstVisibleOption();
                    break;
                case 40: // Down
                    this.focusFirstOption();
                    break;
                case 9: // Tab
                    this.hidePanel();
                    break;
            }
        });

        this.searchTextInput.addEventListener('input', () => {
            this.currentSearchInput = this.searchTextInput.value;
            this.processSearchInput();
        });

        this.optionDisplayList.addEventListener('keydown', (event) => {
            if (![38, 40].includes(event.keyCode)) return; // Up, Down
            event.preventDefault();
            event.stopPropagation();

            const availableOptions = Array.from(this.optionDisplayList.querySelectorAll('li:not(.hidden) > a:not(.group-heading)'));
            if (!availableOptions.length) return;

            if (event.keyCode === 38) { // Up
                this.activeOptionIndex--;
            } else if (event.keyCode === 40) { // Down
                this.activeOptionIndex++;
            }

            if (this.activeOptionIndex < 0) {
                this.activeOptionIndex = -1;
                this.searchTextInput.focus();
            } else if (this.activeOptionIndex >= availableOptions.length) {
                this.activeOptionIndex = availableOptions.length - 1;
            }

            if (this.activeOptionIndex >= 0) {
                availableOptions[this.activeOptionIndex].focus();
            }
        });

        this.optionDisplayList.addEventListener('click', (event) => {
            const targetLink = event.target.closest('a[data-option-value]');
            if (targetLink) {
                const itemPayload = JSON.parse(targetLink.dataset.originalItem);
                this.handleOptionSelection(itemPayload);
            }
        });

        if (this.addActionButton) {
            this.addActionButton.addEventListener('click', (event) => {
                event.stopPropagation();
                if (typeof this.configuration.onEntryAdd === 'function') {
                    this.configuration.onEntryAdd(this.handleOptionSelection.bind(this));
                }
            });
        }

        document.addEventListener('click', (event) => {
            if (this.isPanelVisible && !this.outerContainer.contains(event.target)) {
                this.hidePanel();
            }
        });

        const attributeMonitor = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                    if (this.sourceElement.hasAttribute('disabled')) {
                        this.displayFacet.classList.add('disabled');
                        this.hidePanel();
                    } else {
                        this.displayFacet.classList.remove('disabled');
                    }
                }
            });
        });
        attributeMonitor.observe(this.sourceElement, { attributes: true });
    }

    togglePanelVisibility() {
        if (this.isPanelVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        if (this.sourceElement.hasAttribute('disabled')) return;
        this.panelOverlay.classList.remove('hidden');
        this.isPanelVisible = true;
        this.activeOptionIndex = -1;
        this.searchTextInput.value = '';
        this.currentSearchInput = '';
        this.lastSearchString = '';
        this.renderOptionList(this.rawDataCollection);
        this.searchTextInput.focus();
    }

    hidePanel() {
        this.panelOverlay.classList.add('hidden');
        this.isPanelVisible = false;
        this.displayFacet.focus();
    }

    updateDisplayLabel() {
        let newLabel = this.configuration.displayPlaceholder;
        if (this.currentSelectionValue !== null && this.rawDataCollection.length > 0) {
            const { loopItemName, loopKeyName, valueAccessor, labelAccessor } = this.optionParsingDetails;
            
            const foundItemWrapper = this.rawDataCollection.find(itemWrapper => {
                const evaluationContext = {};
                if (loopKeyName) {
                    evaluationContext[loopKeyName] = itemWrapper.key;
                    evaluationContext[loopItemName] = itemWrapper.value;
                } else {
                    evaluationContext[loopItemName] = itemWrapper;
                }
                return evaluateScopedExpression(evaluationContext, valueAccessor) === this.currentSelectionValue;
            });

            if (foundItemWrapper) {
                const evaluationContext = {};
                if (loopKeyName) {
                    evaluationContext[loopKeyName] = foundItemWrapper.key;
                    evaluationContext[loopItemName] = foundItemWrapper.value;
                } else {
                    evaluationContext[loopItemName] = foundItemWrapper;
                }
                newLabel = String(evaluateScopedExpression(evaluationContext, labelAccessor));
            }
        }
        this.labelSpan.textContent = newLabel;
        this.displayedText = newLabel;
    }

    processSearchInput = delayExecution(() => {
        const currentSearchQuery = this.currentSearchInput.trim();
        if (currentSearchQuery === this.lastSearchString) return;

        this.lastSearchString = currentSearchQuery;

        if (typeof this.configuration.onSearchTrigger === 'function') {
            this.configuration.onSearchTrigger(currentSearchQuery);
        } else {
            this.filterLocalOptions(currentSearchQuery);
        }
    }, this.configuration.searchDelayDuration);

    filterLocalOptions(query) {
        if (!query) {
            this.visibleDataCollection = this.rawDataCollection;
        } else {
            const { loopItemName, loopKeyName, labelAccessor } = this.optionParsingDetails;
            this.visibleDataCollection = this.rawDataCollection.filter(itemWrapper => {
                const evaluationContext = {};
                if (loopKeyName) {
                    evaluationContext[loopKeyName] = itemWrapper.key;
                    evaluationContext[loopItemName] = itemWrapper.value;
                } else {
                    evaluationContext[loopItemName] = itemWrapper;
                }
                const itemLabel = String(evaluateScopedExpression(evaluationContext, labelAccessor)).toLowerCase();
                return itemLabel.includes(query.toLowerCase());
            });
        }
        this.renderOptionList(this.visibleDataCollection);
    }

    renderOptionList(dataForDisplay) {
        this.optionDisplayList.innerHTML = '';
        this.activeOptionIndex = -1;

        if (!dataForDisplay || dataForDisplay.length === 0) {
            this.feedbackMessageItem.classList.remove('hidden');
            this.noSearchQuerySpan.classList.toggle('hidden', !!this.lastSearchString);
            this.hasSearchQuerySpan.classList.toggle('hidden', !this.lastSearchString);
            if (this.queryHighlightSpan) {
                this.queryHighlightSpan.textContent = this.lastSearchString;
            }
            this.optionDisplayList.appendChild(this.feedbackMessageItem);
            return;
        } else {
            this.feedbackMessageItem.classList.add('hidden');
        }

        const { loopItemName, loopKeyName, valueAccessor, labelAccessor, groupAccessor } = this.optionParsingDetails;
        let activeGroup = null;

        dataForDisplay.forEach(itemWrapper => {
            const evaluationContext = {};
            if (loopKeyName) {
                evaluationContext[loopKeyName] = itemWrapper.key;
                evaluationContext[loopItemName] = itemWrapper.value;
            } else {
                evaluationContext[loopItemName] = itemWrapper;
            }

            const itemValue = evaluateScopedExpression(evaluationContext, valueAccessor);
            const itemLabel = String(evaluateScopedExpression(evaluationContext, labelAccessor));
            const itemGroup = groupAccessor ? String(evaluateScopedExpression(evaluationContext, groupAccessor)) : null;

            if (groupAccessor && itemGroup !== activeGroup) {
                activeGroup = itemGroup;
                const groupHeaderItem = document.createElement('li');
                groupHeaderItem.className = 'group-heading-item';
                groupHeaderItem.innerHTML = `<a class="group-heading" tabindex="-1">${activeGroup}</a>`;
                this.optionDisplayList.appendChild(groupHeaderItem);
            }

            const optionItem = document.createElement('li');
            optionItem.setAttribute('role', 'presentation');
            const optionLink = document.createElement('a');
            optionLink.setAttribute('role', 'menuitem');
            optionLink.setAttribute('tabindex', '-1');
            optionLink.setAttribute('href', '#');
            optionLink.dataset.optionValue = JSON.stringify(itemValue);
            optionLink.dataset.originalItem = JSON.stringify(itemWrapper);

            let displayHtml = itemLabel;
            if (this.lastSearchString && typeof this.configuration.onSearchTrigger !== 'function') {
                const queryLower = this.lastSearchString.toLowerCase();
                const labelLower = itemLabel.toLowerCase();
                const startIndex = labelLower.indexOf(queryLower);
                if (startIndex !== -1) {
                    const endIndex = startIndex + queryLower.length;
                    displayHtml = itemLabel.substring(0, startIndex) +
                                  `<span class="query-highlight">${itemLabel.substring(startIndex, endIndex)}</span>` +
                                  itemLabel.substring(endIndex);
                }
            }
            optionLink.innerHTML = displayHtml;
            optionItem.appendChild(optionLink);
            this.optionDisplayList.appendChild(optionItem);
        });
    }

    handleOptionSelection(selectedItemPayload) {
        const { loopItemName, loopKeyName, valueAccessor } = this.optionParsingDetails;
        const evaluationContext = {};
        if (loopKeyName) {
            evaluationContext[loopKeyName] = selectedItemPayload.key;
            evaluationContext[loopItemName] = selectedItemPayload.value;
        } else {
            evaluationContext[loopItemName] = selectedItemPayload;
        }
        const newValue = evaluateScopedExpression(evaluationContext, valueAccessor);

        this.setSelectorValue(newValue);
        this.hidePanel();
        this.searchTextInput.value = '';
        this.currentSearchInput = '';

        const originalItemForCallback = loopKeyName ? selectedItemPayload.value : selectedItemPayload;
        if (typeof this.configuration.onValueUpdate === 'function') {
            this.configuration.onValueUpdate(newValue, originalItemForCallback);
        }
    }

    chooseFirstVisibleOption() {
        const firstActiveOption = this.optionDisplayList.querySelector('li:not(.hidden) > a:not(.group-heading)');
        if (firstActiveOption) {
            const itemPayload = JSON.parse(firstActiveOption.dataset.originalItem);
            this.handleOptionSelection(itemPayload);
        }
    }

    focusFirstOption() {
        const firstActiveOption = this.optionDisplayList.querySelector('li:not(.hidden) > a:not(.group-heading)');
        if (firstActiveOption) {
            this.activeOptionIndex = 0;
            firstActiveOption.focus();
        }
    }
}