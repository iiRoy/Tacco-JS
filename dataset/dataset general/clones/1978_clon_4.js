const KeyIdentifier = {
    RETREAT: 27, // ESC
    ACTIVATE: 13, // RETURN
    HOP: 9, // TAB
    ERASE_BACK: 8, // BS
    ERASE_FORWARD: 46, // DEL
    ASCEND: 38, // UP
    DESCEND: 40 // DOWN
};

// Global state to mimic jQuery.data(document.body, ...)
let globalCompletionModeActive = false;
let globalSuppressNextKey = false;

class InputSuggester {
    constructor(inputElem, configuration = {}) {
        if (!inputElem || !(inputElem instanceof HTMLInputElement)) {
            throw new Error("InputSuggester requires a valid HTMLInputElement.");
        }

        this.inputElement = inputElem;
        this.currentValue = this.inputElement.value;
        this.suggestionContainer = null;
        this.typingPauseId = null;
        this.selectionIndex = -1;
        this.isMouseDown = false;

        // Bound event handlers for proper removal
        this._handleKeyInteractionBound = this._handleKeyInteraction.bind(this);
        this._handleKeyPressBound = this._handleKeyPress.bind(this);
        this._processDataRequestBound = (e) => this._processDataRequest(e.detail.data);
        this._initiateCompletionBound = this._initiateCompletion.bind(this);
        this._exitSuggestionModeBound = this._exitSuggestionMode.bind(this);
        this._handleActivationBound = this._handleActivation.bind(this);
        this._cleanupSuggestionModeBound = this._cleanupSuggestionMode.bind(this);
        this._handleWindowClickBound = this._handleWindowClick.bind(this);
        this._handleSuggestionMouseOverBound = this._handleSuggestionMouseOver.bind(this);
        this._handleSuggestionMouseOutBound = this._handleSuggestionMouseOut.bind(this);
        this._handleMouseDownInContainerBound = () => { this.isMouseDown = true; };
        this._handleClickInContainerBound = () => {
            document.body.dispatchEvent(new CustomEvent('activateCompletion'));
            globalSuppressNextKey = false;
        };
        this._handleModeKeydownBound = this._handleModeKeydown.bind(this);


        // Default configuration
        this.config = {
            delayInterval: 500, // timeout
            maxEntriesThreshold: 100, // threshold
            adjustWidth: true,
            maximumResultsDisplayed: undefined, // maxResults
            minimumCharactersForSearch: 0, // minCharacters
            sourceData: [], // list
            retrieveData: (element) => { // getList
                element.dispatchEvent(new CustomEvent('dataRequested', { detail: { data: this.config.sourceData } }));
            },
            assessMatch: (entry, pattern) => { // match
                return (entry.match(pattern) !== null);
            },
            createPattern: (typedText) => { // matcher (case-sensitive by default, matching original RegExp behavior)
                return new RegExp(typedText);
            },
            processEntries: (fullList, entryText) => { // filterList
                const searchPattern = this.config.createPattern(entryText);
                let matchingEntries = [];
                let counter = 0;

                for (let i = 0; i < fullList.length; i++) {
                    if (this.config.assessMatch(fullList[i], searchPattern)) {
                        matchingEntries.push(fullList[i]);
                        counter++;
                        if (this.config.maximumResultsDisplayed !== undefined && counter >= this.config.maximumResultsDisplayed) {
                            break;
                        }
                    }
                }
                return matchingEntries;
            },
            refreshDisplay: (potentialEntries, currentText) => { // updateList
                if (this.config.minimumCharactersForSearch && currentText.length <= this.config.minimumCharactersForSearch) {
                    return null;
                }

                const filteredEntries = this.config.processEntries(potentialEntries, currentText);
                if (filteredEntries.length === 0 || filteredEntries.length > this.config.maxEntriesThreshold) {
                    return null;
                }
                return this.config.constructDisplay(filteredEntries);
            },
            constructDisplay: (entries) => { // buildList
                // Assuming listWrapperMarkup is a simple tag like 'ul' or 'ol'
                let listWrapper = document.createElement(this.config.listWrapperMarkup.replace(/<|>|\//g, ''));
                if (!listWrapper || !/^(ul|ol)$/i.test(listWrapper.tagName)) {
                    listWrapper = document.createElement('ul'); // Fallback to ul
                }
                listWrapper.className = listWrapper.className ? listWrapper.className + ' suggester-list-container' : 'suggester-list-container';

                entries.forEach(item => {
                    const listItem = this.config.createListItem(item);
                    listItem._originalDataItem = item; // Store original object
                    listWrapper.appendChild(listItem);
                });
                return listWrapper;
            },
            listWrapperMarkup: 'ul', // Renamed wrapper
            createListItem: (item) => { // template + insertText
                const li = document.createElement('li');
                li.innerHTML = this.config.formatItemText(item);
                return li;
            },
            showDisplay: (input, container) => { // displayList
                const inputRect = input.getBoundingClientRect();
                
                container.style.position = 'absolute';
                container.style.top = `${inputRect.bottom + window.scrollY}px`;
                container.style.left = `${inputRect.left + window.scrollX}px`;
                if (this.config.adjustWidth) {
                    container.style.width = `${inputRect.width}px`;
                } else {
                    container.style.width = 'auto';
                }
                document.body.appendChild(container);
                return container;
            },
            hideDisplay: (container) => { // dismissList
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            },
            formatItemText: (item) => item // insertText
        };

        Object.assign(this.config, configuration);
        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.inputElement.setAttribute('autocomplete', 'off');
        this.inputElement.addEventListener('keydown', this._handleKeyInteractionBound);
        this.inputElement.addEventListener('keyup', this._handleKeyInteractionBound);
        this.inputElement.addEventListener('keypress', this._handleKeyPressBound);

        this.inputElement.addEventListener('dataRequested', this._processDataRequestBound);
        this.inputElement.addEventListener('initiateCompletion', this._initiateCompletionBound);

        document.body.addEventListener('cancelCompletion', this._exitSuggestionModeBound);
        document.body.addEventListener('activateCompletion', this._handleActivationBound);
        document.body.addEventListener('offCompletion', this._cleanupSuggestionModeBound);
        window.addEventListener('click', this._handleWindowClickBound);
    }

    _handleKeyInteraction(event) {
        const key = event.which || event.keyCode;
        if ((key === KeyIdentifier.ASCEND || key === KeyIdentifier.DESCEND) && !this.typingPauseId) {
            this._startTypingDelay(event);
        } else if (key === KeyIdentifier.ERASE_BACK || key === KeyIdentifier.ERASE_FORWARD) {
            if (this.typingPauseId) {
                clearTimeout(this.typingPauseId);
                this.typingPauseId = null;
            }
            this._startTypingDelay(event);
        } else {
            this._preventTabBehavior(event);
        }
    }

    _handleKeyPress(event) {
        const key = event.which || event.keyCode;
        if (this.typingPauseId) {
            clearTimeout(this.typingPauseId);
            this.typingPauseId = null;
        }

        if (globalSuppressNextKey) {
            globalSuppressNextKey = false;
            event.preventDefault();
            return false;
        } else if (globalCompletionModeActive && key < 32 && key !== KeyIdentifier.ERASE_BACK && key !== KeyIdentifier.ERASE_FORWARD) {
            event.preventDefault();
            return false;
        } else if (key === KeyIdentifier.ERASE_BACK || key === KeyIdentifier.ERASE_FORWARD || key > 32) {
            this._startTypingDelay(event);
        }
    }

    _startTypingDelay(event) {
        this.typingPauseId = setTimeout(() => {
            this.inputElement.dispatchEvent(new CustomEvent('initiateCompletion'));
            this.typingPauseId = null;
        }, this.config.delayInterval);
    }

    _preventTabBehavior(event) {
        if (globalCompletionModeActive && (event.which || event.keyCode) === KeyIdentifier.HOP) {
            event.preventDefault();
        }
    }

    _initiateCompletion() {
        this.config.retrieveData(this.inputElement);
    }

    _processDataRequest(fullDataSet) {
        const currentText = this.inputElement.value;
        const generatedContainer = this.config.refreshDisplay(fullDataSet, currentText);

        document.body.dispatchEvent(new CustomEvent('offCompletion'));
        
        if (!generatedContainer) {
            return;
        }

        this.suggestionContainer = this.config.showDisplay(this.inputElement, generatedContainer);
        this._enterSuggestionMode();
    }

    _enterSuggestionMode() {
        globalCompletionModeActive = true;
        this.currentValue = this.inputElement.value;
        this.selectionIndex = -1;
        this.isMouseDown = false;

        this.suggestionContainer.addEventListener('mouseover', this._handleSuggestionMouseOverBound);
        this.suggestionContainer.addEventListener('mouseout', this._handleSuggestionMouseOutBound);
        this.suggestionContainer.addEventListener('mousedown', this._handleMouseDownInContainerBound);
        this.suggestionContainer.addEventListener('click', this._handleClickInContainerBound);

        this.inputElement.addEventListener('keydown', this._handleModeKeydownBound);
    }

    _exitSuggestionMode() {
        this.inputElement.dispatchEvent(new CustomEvent('completionCancelled'));
        document.body.dispatchEvent(new CustomEvent('offCompletion'));
        this.inputElement.value = this.currentValue;
    }

    _cleanupSuggestionMode() {
        if (this.suggestionContainer) {
            this.config.hideDisplay(this.suggestionContainer);
            this.suggestionContainer.removeEventListener('mouseover', this._handleSuggestionMouseOverBound);
            this.suggestionContainer.removeEventListener('mouseout', this._handleSuggestionMouseOutBound);
            this.suggestionContainer.removeEventListener('mousedown', this._handleMouseDownInContainerBound);
            this.suggestionContainer.removeEventListener('click', this._handleClickInContainerBound);
            this.suggestionContainer = null;
        }
        globalCompletionModeActive = false;
        this.inputElement.removeEventListener('keydown', this._handleModeKeydownBound);
    }

    _handleActivation() {
        const currentSelectionElement = this.suggestionContainer ? this.suggestionContainer.querySelector('.selection-highlight') : null;
        if (currentSelectionElement && currentSelectionElement._originalDataItem) {
            this.inputElement.dispatchEvent(new CustomEvent('completionActivated', {
                detail: {
                    item: currentSelectionElement._originalDataItem,
                    element: currentSelectionElement
                }
            }));
        } else if (this.isMouseDown) {
            this.isMouseDown = false;
            if (document.activeElement !== this.inputElement) {
                this.inputElement.focus();
            }
            return;
        }
        document.body.dispatchEvent(new CustomEvent('offCompletion'));
    }

    _handleWindowClick(event) {
        if (globalCompletionModeActive && !this.inputElement.contains(event.target) && (!this.suggestionContainer || !this.suggestionContainer.contains(event.target))) {
            document.body.dispatchEvent(new CustomEvent('cancelCompletion'));
        }
    }

    _updateSelectionVisuals() {
        if (!this.suggestionContainer) return;

        const allItems = Array.from(this.suggestionContainer.querySelectorAll('li'));
        const currentlySelected = this.suggestionContainer.querySelector('.selection-highlight');
        if (currentlySelected) {
            currentlySelected.classList.remove('selection-highlight');
        }

        if (this.selectionIndex >= 0 && this.selectionIndex < allItems.length) {
            const newSelection = allItems[this.selectionIndex];
            newSelection.classList.add('selection-highlight');
            this.inputElement.dispatchEvent(new CustomEvent('itemSelected', {
                detail: {
                    item: newSelection._originalDataItem,
                    element: newSelection
                }
            }));
            this.inputElement.value = this.config.formatItemText(newSelection._originalDataItem);
        } else {
            this.inputElement.dispatchEvent(new CustomEvent('noItemSelected'));
            this.inputElement.value = this.currentValue;
        }
    }

    _handleSuggestionMouseOver(event) {
        let targetItem = event.target.closest('li');
        if (targetItem && this.suggestionContainer.contains(targetItem)) {
            const allItems = Array.from(this.suggestionContainer.querySelectorAll('li'));
            this.selectionIndex = allItems.indexOf(targetItem);
            this._updateSelectionVisuals();
        }
    }

    _handleSuggestionMouseOut(event) {
        if (!this.suggestionContainer.contains(event.relatedTarget)) {
            this.selectionIndex = -1;
            this._updateSelectionVisuals();
        }
    }

    _handleModeKeydown(event) {
        const key = event.which || event.keyCode;
        const totalItems = this.suggestionContainer ? this.suggestionContainer.querySelectorAll('li').length : 0;

        switch (key) {
            case KeyIdentifier.RETREAT:
                document.body.dispatchEvent(new CustomEvent('cancelCompletion'));
                break;
            case KeyIdentifier.HOP:
            case KeyIdentifier.ACTIVATE:
                if (this.selectionIndex === -1 && totalItems > 0) {
                    this.selectionIndex = 0;
                    this._updateSelectionVisuals();
                }
                document.body.dispatchEvent(new CustomEvent('activateCompletion'));
                break;
            case KeyIdentifier.DESCEND:
                this.selectionIndex = (this.selectionIndex >= totalItems - 1) ? 0 : this.selectionIndex + 1;
                this._updateSelectionVisuals();
                break;
            case KeyIdentifier.ASCEND:
                this.selectionIndex = (this.selectionIndex <= 0) ? totalItems - 1 : this.selectionIndex - 1;
                this._updateSelectionVisuals();
                break;
            default:
                return true;
        }
        globalSuppressNextKey = true;
        event.preventDefault();
    }
}