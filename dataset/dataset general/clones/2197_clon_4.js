class FormInputAdapter {
    constructor(originalSelectElement, configuration = {}) {
        if (!(originalSelectElement instanceof HTMLSelectElement)) {
            throw new Error("Initial element must be an HTMLSelectElement.");
        }

        this.sourceElement = originalSelectElement;
        this.behaviorConfig = {
            uppercaseInput: false,
            maximumLength: 0,
            ...configuration
        };

        this.componentKey = 'combo' + Math.random().toString(36).substr(2, 9);
        this.storedOptions = [];
        this.visibleEntryField = null;
        this.hiddenStorageField = null;
        this.dropdownTriggerButton = null;
        this.optionDisplayList = null;
        this.mainWrapper = null;
        this.currentHighlightedOption = null;

        this._setupComponent();
    }

    _setupComponent() {
        this._extractSourceData();
        this._constructDomElements();
        this._setInitialState();
        this._attachEventHandlers();
        this.sourceElement.style.display = 'none';
    }

    _extractSourceData() {
        Array.from(this.sourceElement.options).forEach(opt => {
            this.storedOptions.push({
                label: opt.textContent,
                val: opt.value
            });
        });
    }

    _constructDomElements() {
        this.mainWrapper = document.createElement('div');
        this.mainWrapper.className = 'custom-input-wrapper';
        this.mainWrapper.id = 'wrap-' + this.componentKey;

        this.hiddenStorageField = document.createElement('input');
        this.hiddenStorageField.type = 'hidden';
        this.hiddenStorageField.className = 'value-holder-field';
        this.hiddenStorageField.id = this.componentKey;
        this.hiddenStorageField.name = this.sourceElement.name;

        this.visibleEntryField = document.createElement('input');
        this.visibleEntryField.type = 'text';
        this.visibleEntryField.className = 'display-text-entry';
        this.visibleEntryField.id = 'entry-' + this.componentKey;
        this.visibleEntryField.setAttribute('autocomplete', 'off');

        this.dropdownTriggerButton = document.createElement('button');
        this.dropdownTriggerButton.type = 'button';
        this.dropdownTriggerButton.className = 'dropdown-control-button';
        this.dropdownTriggerButton.textContent = '▼';

        this.optionDisplayList = document.createElement('ul');
        this.optionDisplayList.className = 'option-results-list';
        this.optionDisplayList.style.display = 'none';
        this.optionDisplayList.style.position = 'absolute';
        this.optionDisplayList.style.zIndex = '1000';
        this.optionDisplayList.style.listStyle = 'none';
        this.optionDisplayList.style.padding = '0';
        this.optionDisplayList.style.margin = '0';
        this.optionDisplayList.style.border = '1px solid #ccc';
        this.optionDisplayList.style.background = '#fff';
        this.optionDisplayList.style.maxHeight = '200px';
        this.optionDisplayList.style.overflowY = 'auto';

        this.mainWrapper.appendChild(this.hiddenStorageField);
        this.mainWrapper.appendChild(this.visibleEntryField);
        this.mainWrapper.appendChild(this.dropdownTriggerButton);
        document.body.appendChild(this.optionDisplayList);

        this.sourceElement.parentNode.insertBefore(this.mainWrapper, this.sourceElement);

        this.sourceElement.removeAttribute('id');
        this.sourceElement.removeAttribute('name');
    }

    _setInitialState() {
        const currentlySelected = this.sourceElement.querySelector('option:checked');
        if (currentlySelected) {
            this.hiddenStorageField.value = currentlySelected.value;
            this.visibleEntryField.value = currentlySelected.textContent;
        }
    }

    _attachEventHandlers() {
        this.visibleEntryField.addEventListener('input', this._handleTextInput.bind(this));
        this.visibleEntryField.addEventListener('change', this._synchronizeValues.bind(this));
        this.visibleEntryField.addEventListener('blur', this._handleInputBlur.bind(this));
        this.visibleEntryField.addEventListener('keydown', this._handleKeyboardInput.bind(this));

        this.dropdownTriggerButton.addEventListener('click', this._handleToggleButtonClick.bind(this));

        this.optionDisplayList.addEventListener('click', this._handleOptionSelection.bind(this));

        document.addEventListener('click', this._handleGlobalClick.bind(this));

        this.sourceElement.addEventListener('change', this._handleOriginalSelectChange.bind(this));
    }

    _handleTextInput(event) {
        let currentContent = event.target.value;

        if (this.behaviorConfig.maximumLength > 0 && currentContent.length > this.behaviorConfig.maximumLength) {
            currentContent = currentContent.substring(0, this.behaviorConfig.maximumLength);
            this.visibleEntryField.value = currentContent;
        }

        if (this.behaviorConfig.uppercaseInput) {
            currentContent = currentContent.toUpperCase();
            this.visibleEntryField.value = currentContent;
        }

        this._filterAndPopulateList(currentContent);
    }

    _synchronizeValues() {
        const enteredText = this.visibleEntryField.value;
        const matchedOption = this.storedOptions.find(choice => choice.label === enteredText);

        if (matchedOption) {
            this.hiddenStorageField.value = matchedOption.val;
        } else {
            this.hiddenStorageField.value = enteredText;
        }
        this.hiddenStorageField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    _handleInputBlur() {
        this._synchronizeValues();
    }

    _handleToggleButtonClick(event) {
        event.stopPropagation();
        if (this.optionDisplayList.style.display === 'none') {
            this._populateAllOptions();
            this._positionOptionList();
            this.optionDisplayList.style.display = 'block';
        } else {
            this._concealOptionList();
        }
    }

    _handleOptionSelection(event) {
        const selectionItem = event.target.closest('li[data-value]');
        if (selectionItem) {
            const selectedLabel = selectionItem.textContent;
            const selectedValue = selectionItem.dataset.value;

            this.visibleEntryField.value = selectedLabel;
            this.hiddenStorageField.value = selectedValue;
            this._synchronizeValues();
            this._concealOptionList();
            this.visibleEntryField.focus();
        }
    }

    _handleGlobalClick(event) {
        if (!this.mainWrapper.contains(event.target) && !this.optionDisplayList.contains(event.target)) {
            this._concealOptionList();
        }
    }

    _handleOriginalSelectChange() {
        const newSelectedOption = this.sourceElement.querySelector('option:checked');
        if (newSelectedOption) {
            this.visibleEntryField.value = newSelectedOption.textContent;
            this.hiddenStorageField.value = newSelectedOption.value;
            this.hiddenStorageField.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    _filterAndPopulateList(searchKey) {
        this.optionDisplayList.innerHTML = '';
        this.currentHighlightedOption = null;
        const filteredResults = this.storedOptions.filter(choice =>
            choice.label.toLowerCase().includes(searchKey.toLowerCase())
        );

        if (filteredResults.length > 0 && searchKey.length > 0) {
            filteredResults.forEach(choice => {
                const li = document.createElement('li');
                li.textContent = choice.label;
                li.dataset.value = choice.val;
                li.className = 'option-list-item';
                this.optionDisplayList.appendChild(li);
            });
            this._positionOptionList();
            this.optionDisplayList.style.display = 'block';
        } else {
            this._concealOptionList();
        }
    }

    _populateAllOptions() {
        this.optionDisplayList.innerHTML = '';
        this.currentHighlightedOption = null;
        this.storedOptions.forEach(choice => {
            const li = document.createElement('li');
            li.textContent = choice.label;
            li.dataset.value = choice.val;
            li.className = 'option-list-item';
            this.optionDisplayList.appendChild(li);
        });
    }

    _positionOptionList() {
        const inputBounds = this.visibleEntryField.getBoundingClientRect();
        this.optionDisplayList.style.minWidth = inputBounds.width + 'px';
        this.optionDisplayList.style.top = (window.scrollY + inputBounds.bottom) + 'px';
        this.optionDisplayList.style.left = (window.scrollX + inputBounds.left) + 'px';
    }

    _concealOptionList() {
        this.optionDisplayList.style.display = 'none';
        if (this.currentHighlightedOption) {
            this.currentHighlightedOption.classList.remove('highlighted-option');
            this.currentHighlightedOption = null;
        }
    }

    _handleKeyboardInput(event) {
        const isListVisible = this.optionDisplayList.style.display !== 'none';
        let nextHighlightTarget = null;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isListVisible) {
                    this._populateAllOptions();
                    this._positionOptionList();
                    this.optionDisplayList.style.display = 'block';
                    nextHighlightTarget = this.optionDisplayList.firstElementChild;
                } else if (this.currentHighlightedOption) {
                    nextHighlightTarget = this.currentHighlightedOption.nextElementSibling;
                } else {
                    nextHighlightTarget = this.optionDisplayList.firstElementChild;
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (isListVisible && this.currentHighlightedOption) {
                    nextHighlightTarget = this.currentHighlightedOption.previousElementSibling;
                } else if (isListVisible) {
                    nextHighlightTarget = this.optionDisplayList.lastElementChild;
                }
                break;
            case 'Enter':
                if (isListVisible && this.currentHighlightedOption) {
                    event.preventDefault();
                    this.currentHighlightedOption.click();
                }
                this._concealOptionList();
                return;
            case 'Escape':
                this._concealOptionList();
                this.visibleEntryField.blur();
                return;
            default:
                return;
        }

        if (this.currentHighlightedOption) {
            this.currentHighlightedOption.classList.remove('highlighted-option');
        }
        if (nextHighlightTarget) {
            nextHighlightTarget.classList.add('highlighted-option');
            this.currentHighlightedOption = nextHighlightTarget;
            this.currentHighlightedOption.scrollIntoView({ block: 'nearest', inline: 'start' });
        }
    }

    destroyComponent() {
        this.visibleEntryField.removeEventListener('input', this._handleTextInput);
        this.visibleEntryField.removeEventListener('change', this._synchronizeValues);
        this.visibleEntryField.removeEventListener('blur', this._handleInputBlur);
        this.visibleEntryField.removeEventListener('keydown', this._handleKeyboardInput);
        this.dropdownTriggerButton.removeEventListener('click', this._handleToggleButtonClick);
        this.optionDisplayList.removeEventListener('click', this._handleOptionSelection);
        document.removeEventListener('click', this._handleGlobalClick);
        this.sourceElement.removeEventListener('change', this._handleOriginalSelectChange);

        this.sourceElement.setAttribute('id', this.componentKey);
        this.sourceElement.setAttribute('name', this.hiddenStorageField.name);
        this.sourceElement.style.display = '';

        this.mainWrapper.parentNode.removeChild(this.mainWrapper);
        this.optionDisplayList.parentNode.removeChild(this.optionDisplayList);

        this.sourceElement = null;
        this.behaviorConfig = null;
        this.componentKey = null;
        this.storedOptions = null;
        this.visibleEntryField = null;
        this.hiddenStorageField = null;
        this.dropdownTriggerButton = null;
        this.optionDisplayList = null;
        this.mainWrapper = null;
        this.currentHighlightedOption = null;
    }
}

// A global function to emulate a plugin-like initialization
function enableFormCombos(targetSelector, customOptions) {
    const targetElements = document.querySelectorAll(targetSelector);
    const activeInstances = [];
    targetElements.forEach(element => {
        activeInstances.push(new FormInputAdapter(element, customOptions));
    });
    return activeInstances;
}