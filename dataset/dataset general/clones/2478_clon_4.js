class TagManager {
    #element;
    #config;
    #entries;
    #displayContainer;
    #entryField;
    #originalInput;
    #sizeMeasurementTool;
    #listenerRegistry;

    constructor(sourceElement, customSettings) {
        this.#element = sourceElement;
        this.#config = this.#synthesizeSettings(customSettings);
        this.#entries = [];
        this.#listenerRegistry = new Map();

        this.#constructVisualComponents();
        this.#configureEntryFieldSizing();

        if (this.#originalInput.value) {
            this.#processInitialEntries(this.#originalInput.value);
        }

        this.#bindInteractionHandlers();

        this.#entryField.value = this.#config.placeholderText;
        this.#entryField.style.color = this.#config.placeholderColor;
        this.#updateEntryFieldSize();
    }

    #synthesizeSettings(customSettings) {
        const standardSettings = {
            interactiveMode: true,
            placeholderText: 'add an item',
            minimumCharacters: 0,
            visualWidth: '300px',
            visualHeight: '100px',
            autoSuggestion: null,
            concealOriginal: true,
            itemDelimiter: ',',
            uniqueEntries: true,
            removeViaBackspace: true,
            placeholderColor: '#666666',
            dynamicInputSize: true,
            sizePadding: 20,
            inputVisualPadding: 12
        };
        return { ...standardSettings, ...customSettings };
    }

    #constructVisualComponents() {
        const uniqueId = this.#element.id || `entrySystem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.#element.id = uniqueId;
        this.#originalInput = this.#element;

        if (this.#config.concealOriginal) {
            this.#originalInput.style.display = 'none';
        }

        this.#displayContainer = document.createElement('div');
        this.#displayContainer.className = 'entry-visual-container';
        this.#displayContainer.id = `${uniqueId}-visuals`;
        this.#displayContainer.style.width = this.#config.visualWidth;
        this.#displayContainer.style.minHeight = this.#config.visualHeight;
        this.#displayContainer.style.height = this.#config.visualHeight;

        const entryInputArea = document.createElement('div');
        entryInputArea.className = 'entry-input-area';
        entryInputArea.id = `${uniqueId}-input-field-wrapper`;

        if (this.#config.interactiveMode) {
            this.#entryField = document.createElement('input');
            this.#entryField.id = `${uniqueId}-text-entry`;
            this.#entryField.setAttribute('type', 'text');
            this.#entryField.setAttribute('data-default-value', this.#config.placeholderText);
            this.#entryField.value = this.#config.placeholderText;
            entryInputArea.appendChild(this.#entryField);
        }

        this.#displayContainer.appendChild(entryInputArea);

        const clearFormattingDiv = document.createElement('div');
        clearFormattingDiv.className = 'entry-clear-fix';
        this.#displayContainer.appendChild(clearFormattingDiv);

        this.#originalInput.parentNode.insertBefore(this.#displayContainer, this.#originalInput.nextSibling);
    }

    #configureEntryFieldSizing() {
        if (!this.#config.dynamicInputSize || !this.#entryField) return;

        const minFieldWidth = parseFloat(this.#entryField.dataset.minWidth) || this.#config.minInputWidth || this.#entryField.offsetWidth;
        const maxFieldWidth = parseFloat(this.#entryField.dataset.maxWidth) || this.#config.maxInputWidth || (this.#displayContainer.offsetWidth - this.#config.inputVisualPadding);

        this.#entryField.dataset.minWidth = minFieldWidth;
        this.#entryField.dataset.maxWidth = maxFieldWidth;
        this.#entryField.style.width = `${minFieldWidth}px`;

        const measurementToolId = `${this.#entryField.id}-width-gauge`;
        this.#sizeMeasurementTool = document.getElementById(measurementToolId);
        if (!this.#sizeMeasurementTool) {
            this.#sizeMeasurementTool = document.createElement('span');
            this.#sizeMeasurementTool.id = measurementToolId;
            this.#sizeMeasurementTool.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: auto;
                font-size: ${getComputedStyle(this.#entryField).fontSize};
                font-family: ${getComputedStyle(this.#entryField).fontFamily};
                font-weight: ${getComputedStyle(this.#entryField).fontWeight};
                letter-spacing: ${getComputedStyle(this.#entryField).letterSpacing};
                white-space: nowrap;
                visibility: hidden;
            `;
            document.body.appendChild(this.#sizeMeasurementTool);
        }
        this.#entryField.dataset.measurementToolId = measurementToolId;
    }

    #updateEntryFieldSize() {
        if (!this.#config.dynamicInputSize || !this.#entryField || !this.#sizeMeasurementTool) return;

        const currentText = this.#entryField.value;
        const minWidth = parseFloat(this.#entryField.dataset.minWidth);
        const maxWidth = parseFloat(this.#entryField.dataset.maxWidth);

        this.#sizeMeasurementTool.textContent = currentText.replace(/&/g, '&amp;').replace(/\s/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        const measuredWidth = this.#sizeMeasurementTool.offsetWidth;
        let calculatedWidth = measuredWidth + this.#config.sizePadding;

        calculatedWidth = Math.max(minWidth, calculatedWidth);
        calculatedWidth = Math.min(maxWidth, calculatedWidth);

        const currentFieldWidth = this.#entryField.offsetWidth;

        if (calculatedWidth !== currentFieldWidth) {
            this.#entryField.style.width = `${calculatedWidth}px`;
        }
    }

    #bindInteractionHandlers() {
        if (!this.#config.interactiveMode) return;

        this.#displayContainer.addEventListener('click', () => {
            this.#entryField.focus();
        });

        this.#entryField.addEventListener('focus', () => {
            if (this.#entryField.value === this.#config.placeholderText) {
                this.#entryField.value = '';
            }
            this.#entryField.style.color = '#000000';
        });

        const handleFieldBlur = () => {
            const typedText = this.#entryField.value.trim();
            if (typedText && typedText !== this.#config.placeholderText) {
                if (typedText.length >= this.#config.minimumCharacters) {
                    this.addEntry(typedText, { focusAfter: true, uniqueCheck: this.#config.uniqueEntries });
                }
            } else {
                this.#entryField.value = this.#config.placeholderText;
                this.#entryField.style.color = this.#config.placeholderColor;
            }
            this.#updateEntryFieldSize();
        };

        if (!this.#config.autoSuggestion) { // Only add blur handler if no auto-suggestion
            this.#entryField.addEventListener('blur', handleFieldBlur);
        } else {
            // If auto-suggestion is enabled, the blur behavior might be handled differently
            // by the auto-suggestion component, or simply not add a tag on blur.
            // For this Type IV clone, we ensure the original blur handler is not present.
        }


        this.#entryField.addEventListener('keypress', (event) => {
            if (this.#isSeparatorKey(event)) {
                event.preventDefault();
                const typedText = this.#entryField.value.trim();
                if (typedText.length >= this.#config.minimumCharacters) {
                    this.addEntry(typedText, { focusAfter: true, uniqueCheck: this.#config.uniqueEntries });
                }
                this.#updateEntryFieldSize();
            } else if (this.#config.dynamicInputSize) {
                setTimeout(() => this.#updateEntryFieldSize(), 0);
            }
        });

        if (this.#config.removeViaBackspace) {
            this.#entryField.addEventListener('keydown', (event) => {
                if (event.key === 'Backspace' && this.#entryField.value === '') {
                    event.preventDefault();
                    const lastEntryElement = this.#displayContainer.querySelector('.added-item:last-of-type');
                    if (lastEntryElement) {
                        const entryDataValue = lastEntryElement.dataset.itemValue;
                        this.removeEntry(entryDataValue);
                        this.#entryField.focus();
                    }
                }
            });
        }

        if (this.#config.uniqueEntries) {
            this.#entryField.addEventListener('input', () => {
                this.#entryField.classList.remove('non-valid-input');
            });
        }
    }

    #isSeparatorKey(event) {
        if (event.key === 'Enter') {
            return true;
        }
        const separators = this.#config.itemDelimiter.split('');
        return separators.includes(event.key);
    }

    addEntry(value, options = {}) {
        const settings = { focusAfter: false, uniqueCheck: true, triggerCallbacks: true, ...options };
        const cleanedValue = value.trim();

        if (!cleanedValue) return false;

        if (settings.uniqueCheck && this.#entryExists(cleanedValue)) {
            this.#entryField.classList.add('non-valid-input');
            return false;
        }

        this.#entries.push(cleanedValue);
        this.#refreshVisualEntries();
        this.#synchronizeHiddenField();

        this.#entryField.value = '';
        if (settings.focusAfter) {
            this.#entryField.focus();
        } else {
            this.#entryField.blur();
        }
        this.#updateEntryFieldSize();

        if (settings.triggerCallbacks && this.#listenerRegistry.has('onItemAdded')) {
            this.#listenerRegistry.get('onItemAdded')(cleanedValue);
        }
        if (settings.triggerCallbacks && this.#listenerRegistry.has('onItemsModified')) {
            this.#listenerRegistry.get('onItemsModified')(this.#entries, cleanedValue);
        }
        return true;
    }

    removeEntry(value) {
        const decodedValue = decodeURIComponent(value);
        const entryIndex = this.#entries.indexOf(decodedValue);
        if (entryIndex > -1) {
            this.#entries.splice(entryIndex, 1);
            this.#refreshVisualEntries();
            this.#synchronizeHiddenField();

            if (this.#listenerRegistry.has('onItemRemoved')) {
                this.#listenerRegistry.get('onItemRemoved')(decodedValue);
            }
            if (this.#listenerRegistry.has('onItemsModified')) {
                this.#listenerRegistry.get('onItemsModified')(this.#entries);
            }
            this.#updateEntryFieldSize();
            return true;
        }
        return false;
    }

    #entryExists(value) {
        return this.#entries.includes(value);
    }

    #refreshVisualEntries() {
        const existingItemElements = this.#displayContainer.querySelectorAll('.added-item');
        existingItemElements.forEach(itemEl => itemEl.remove());

        const inputWrapper = this.#displayContainer.querySelector('.entry-input-area');
        const inputFieldReference = this.#entryField;

        this.#entries.forEach(itemValue => {
            const itemSpan = document.createElement('span');
            itemSpan.className = 'added-item';
            itemSpan.dataset.itemValue = itemValue;
            itemSpan.innerHTML = `<span>${itemValue}&nbsp;&nbsp;</span>`;

            const removalLink = document.createElement('a');
            removalLink.setAttribute('href', '#');
            removalLink.setAttribute('title', 'Remove item');
            removalLink.textContent = 'x';
            removalLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.removeEntry(encodeURIComponent(itemValue));
            });
            itemSpan.appendChild(removalLink);
            inputWrapper.insertBefore(itemSpan, inputFieldReference);
        });
    }

    #synchronizeHiddenField() {
        this.#originalInput.value = this.#entries.join(this.#config.itemDelimiter);
    }

    #processInitialEntries(entryString) {
        this.#entries = [];
        this.#refreshVisualEntries();
        if (entryString) {
            const initialItems = entryString.split(this.#config.itemDelimiter).map(s => s.trim()).filter(s => s);
            initialItems.forEach(item => this.addEntry(item, { focusAfter: false, triggerCallbacks: false, uniqueCheck: this.#config.uniqueEntries }));
        }
        this.#synchronizeHiddenField();
        if (this.#listenerRegistry.has('onItemsModified')) {
            this.#listenerRegistry.get('onItemsModified')(this.#entries);
        }
        this.#updateEntryFieldSize();
    }

    registerEventHandler(eventName, callback) {
        const permittedEvents = ['onItemAdded', 'onItemRemoved', 'onItemsModified'];
        if (permittedEvents.includes(eventName) && typeof callback === 'function') {
            this.#listenerRegistry.set(eventName, callback);
        }
    }

    getStoredEntries() {
        return [...this.#entries];
    }
}

function establishEntrySystem(targetSelectorOrElement, settings = {}) {
    const elementsToProcess = typeof targetSelectorOrElement === 'string' ? document.querySelectorAll(targetSelectorOrElement) : [targetSelectorOrElement];

    const activeInstances = [];
    elementsToProcess.forEach(el => {
        if (el instanceof HTMLInputElement) {
            if (!el.dataset.entrySystemInitialized) {
                const managerInstance = new TagManager(el, settings);
                el.dataset.entrySystemInitialized = 'true';
                el.entrySystemInstance = managerInstance;
                activeInstances.push(managerInstance);
            } else {
                activeInstances.push(el.entrySystemInstance);
            }
        }
    });

    return activeInstances.length === 1 ? activeInstances[0] : activeInstances;
}