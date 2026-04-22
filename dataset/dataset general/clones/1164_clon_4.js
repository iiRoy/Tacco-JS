class TextCompletion {
    constructor(inputElementReference, sourceDataset) {
        if (!(inputElementReference instanceof HTMLElement)) {
            console.error("The provided input element is not a valid HTML element.");
            return;
        }

        this._inputNode = inputElementReference;
        this._sourceData = sourceDataset;
        this._displayBox = null;
        this._currentKeyboardSelection = -1; // -1 indicates no active selection via keyboard

        this._keyMapping = {
            upArrow: 38,
            downArrow: 40,
            selectionConfirm: 13
        };

        this._highlightStyle = {
            listStyle: 'none',
            backgroundColor: '#ececec'
        };

        this._normalStyle = {
            listStyle: 'none',
            backgroundColor: '#fff'
        };

        this._boxDisplayRules = {
            width: '200px',
            position: 'absolute',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            zIndex: '1000',
            overflow: 'hidden', // Prevent scrollbars if content is too wide
            maxHeight: '200px' // Limit height to prevent overly long lists
        };

        // Bind event handlers to the instance for correct 'this' context
        this._boundHandleInputLossFocus = this._handleInputLossFocus.bind(this);
        this._boundHandleKeyInput = this._handleKeyInput.bind(this);
        this._boundHandleTextEntry = this._handleTextEntry.bind(this);
        this._boundHandleBoxMouseOver = this._handleBoxMouseOver.bind(this);
        this._boundHandleBoxMouseOut = this._handleBoxMouseOut.bind(this);
        this._boundHandleBoxClick = this._handleBoxClick.bind(this);

        this._initializeComponent();
    }

    _applyCssRules(element, rules) {
        for (const property in rules) {
            element.style[property] = rules[property];
        }
    }

    _createOrGetDisplayBox() {
        let existingBox = document.getElementById('autocomplete-suggestion-list');
        if (existingBox) {
            this._displayBox = existingBox;
            this._clearDisplayBox();
        } else {
            this._displayBox = document.createElement('div');
            this._displayBox.id = 'autocomplete-suggestion-list';
            this._applyCssRules(this._displayBox, this._boxDisplayRules);
            document.body.appendChild(this._displayBox); // Append to body for absolute positioning
        }
        
        // Attach delegated event listeners to the display box
        this._displayBox.addEventListener('mouseover', this._boundHandleBoxMouseOver);
        this._displayBox.addEventListener('mouseout', this._boundHandleBoxMouseOut);
        this._displayBox.addEventListener('click', this._boundHandleBoxClick);
    }

    _positionDisplayBox() {
        const inputRect = this._inputNode.getBoundingClientRect();
        this._displayBox.style.top = `${inputRect.bottom + window.scrollY}px`;
        this._displayBox.style.left = `${inputRect.left + window.scrollX}px`;
        this._displayBox.style.width = `${inputRect.width}px`; // Match input width
    }

    _clearDisplayBox() {
        this._currentKeyboardSelection = -1;
        if (this._displayBox) {
            while (this._displayBox.firstChild) {
                this._displayBox.removeChild(this._displayBox.firstChild);
            }
            if (this._displayBox.parentNode) {
                this._displayBox.parentNode.removeChild(this._displayBox); // Remove from DOM
            }
            this._displayBox.removeEventListener('mouseover', this._boundHandleBoxMouseOver);
            this._displayBox.removeEventListener('mouseout', this._boundHandleBoxMouseOut);
            this._displayBox.removeEventListener('click', this._boundHandleBoxClick);
            this._displayBox = null; // Clear reference
        }
    }

    _navigateSelection(delta) {
        if (!this._displayBox || !this._displayBox.children.length) return;

        const allOptions = Array.from(this._displayBox.children);
        let newIndex = this._currentKeyboardSelection + delta;

        // Clamp newIndex within valid bounds
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= allOptions.length) newIndex = allOptions.length - 1;

        if (newIndex !== this._currentKeyboardSelection) {
            // Revert previous selection's style
            if (this._currentKeyboardSelection !== -1) {
                this._applyCssRules(allOptions[this._currentKeyboardSelection], this._normalStyle);
            }
            // Apply new selection's style
            this._applyCssRules(allOptions[newIndex], this._highlightStyle);
            this._currentKeyboardSelection = newIndex;
            // Scroll into view
            allOptions[newIndex].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    _generateSuggestions(currentText) {
        this._clearDisplayBox();
        if (!currentText.length) return;

        this._createOrGetDisplayBox(); // Ensure display box exists and is ready
        this._positionDisplayBox();

        const lowercaseInput = currentText.toLowerCase();
        let matchesFound = false;

        this._sourceData.filter(item => item.toLowerCase().includes(lowercaseInput))
            .forEach(item => {
                const highlightPattern = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + lowercaseInput + ")(?![^<>]*>)(?![^&;]+;)", "gi");
                const highlightedHtml = item.replace(highlightPattern, "<strong>$1</strong>");
                
                const optionItem = document.createElement('li');
                optionItem.innerHTML = highlightedHtml;
                this._applyCssRules(optionItem, this._normalStyle);
                this._displayBox.appendChild(optionItem);
                matchesFound = true;
            });

        if (matchesFound) {
            this._currentKeyboardSelection = 0;
            this._applyCssRules(this._displayBox.firstElementChild, this._highlightStyle);
        } else {
            this._clearDisplayBox(); // No matches, remove the display box
        }
    }

    _handleInputLossFocus(event) {
        // Delay clearing to allow click events on suggestions to fire
        setTimeout(() => {
            if (this._displayBox && this._displayBox.parentNode) {
                this._clearDisplayBox();
            }
        }, 150);
    }

    _handleKeyInput(event) {
        const keyCode = event.keyCode;

        if (keyCode === this._keyMapping.selectionConfirm) {
            if (this._currentKeyboardSelection !== -1 && this._displayBox && this._displayBox.children[this._currentKeyboardSelection]) {
                this._inputNode.value = this._displayBox.children[this._currentKeyboardSelection].textContent;
                this._clearDisplayBox();
                event.preventDefault();
                event.stopPropagation();
            }
        } else if (keyCode === this._keyMapping.upArrow) {
            this._navigateSelection(-1);
            event.preventDefault();
            event.stopPropagation();
        } else if (keyCode === this._keyMapping.downArrow) {
            this._navigateSelection(1);
            event.preventDefault();
            event.stopPropagation();
        }
    }

    _handleTextEntry(event) {
        const keyCode = event.keyCode;
        if (keyCode === this._keyMapping.selectionConfirm || keyCode === this._keyMapping.upArrow || keyCode === this._keyMapping.downArrow) {
            return; // Handled by keydown
        }
        this._generateSuggestions(this._inputNode.value);
    }

    _handleBoxMouseOver(event) {
        let hoveredItem = event.target.closest('li');
        if (hoveredItem && this._displayBox.contains(hoveredItem)) {
            // Revert previous keyboard selection's style if it's different from hovered
            if (this._currentKeyboardSelection !== -1 && this._displayBox.children[this._currentKeyboardSelection]) {
                this._applyCssRules(this._displayBox.children[this._currentKeyboardSelection], this._normalStyle);
            }

            // Apply highlight style to the currently hovered item
            this._applyCssRules(hoveredItem, this._highlightStyle);
            // Update keyboard selection index to match hovered item for continuity
            this._currentKeyboardSelection = Array.from(this._displayBox.children).indexOf(hoveredItem);
        }
    }

    _handleBoxMouseOut(event) {
        let leavingItem = event.target.closest('li');
        // Check if the mouse is truly leaving an LI, not just moving to a child or another LI
        if (leavingItem && this._displayBox.contains(leavingItem) && !leavingItem.contains(event.relatedTarget)) {
            this._applyCssRules(leavingItem, this._normalStyle);
            // Do not reset _currentKeyboardSelection here, as it's for keyboard navigation.
            // Mouseout only reverts visual style for the item.
        }
    }

    _handleBoxClick(event) {
        let clickedItem = event.target.closest('li');
        if (clickedItem && this._displayBox.contains(clickedItem)) {
            this._inputNode.value = clickedItem.textContent;
            this._clearDisplayBox();
            this._inputNode.focus(); // Return focus to input after selection
        }
    }

    _attachListeners() {
        this._inputNode.addEventListener('blur', this._boundHandleInputLossFocus);
        this._inputNode.addEventListener('keydown', this._boundHandleKeyInput);
        this._inputNode.addEventListener('keyup', this._boundHandleTextEntry);
    }

    _detachListeners() {
        this._inputNode.removeEventListener('blur', this._boundHandleInputLossFocus);
        this._inputNode.removeEventListener('keydown', this._boundHandleKeyInput);
        this._inputNode.removeEventListener('keyup', this._boundHandleTextEntry);
        // _clearDisplayBox already handles removing listeners from _displayBox
    }

    _initializeComponent() {
        this._attachListeners();
    }
}