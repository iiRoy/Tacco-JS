(function() {
    "use strict";

    // --- Utility Functions ---
    const checkNullOrEmpty = (val) => {
        return (val === false || val === '' || val === null || val === undefined);
    };

    const isObjectEmpty = (val) => {
        return checkNullOrEmpty(val) || (Object.keys(val).length === 0 && val.constructor === Object);
    };

    const elementExists = (node) => {
        return node && node.nodeType === Node.ELEMENT_NODE && node.isConnected;
    };

    const isTextString = (val) => {
        return (typeof val === 'string' || val instanceof String);
    };

    const isList = (val) => {
        return Array.isArray(val);
    };

    const listContains = (val, arr) => {
        return arr.includes(val);
    };

    const raiseError = (message) => {
        throw new Error("Selection Widget Error: " + message);
    };

    // --- Global State and Configuration ---
    let uniqueInstanceCounter = 0;
    const instanceMap = new WeakMap(); // To store instances by element

    const standardSettings = {
        label: false,
        initialSelection: null,
        fallbackValue: null,
        displayMode: 'bottom', // Corresponds to 'placement'
        avoidCollision: true, // Corresponds to 'collision'
        animatePanel: true,
        concealOnChoose: false, // Corresponds to 'hideOnSelect'
        showControls: false, // Corresponds to 'showFooter'
        searchInControls: false, // Corresponds to 'searchInFooter'
        requireConfirmation: false, // Corresponds to 'mustAccept'
        selectedHighlightClass: 'highlight-active', // Corresponds to 'selectedCustomClass'
        availableChoices: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
        inputSelector: 'input', // Corresponds to 'input'
        triggerSelector: '.input-group-addon', // Corresponds to 'component'
        parentContainer: false, // Corresponds to 'container'
        layoutOptions: { // Corresponds to 'templates'
            panelTemplate: '<div class="widget-panel popover"><div class="arrow-indicator"></div><div class="panel-header"></div><div class="panel-body"></div></div>',
            controlPanelTemplate: '<div class="panel-controls"></div>',
            actionButtonsTemplate: '<button class="widget-action widget-cancel btn btn-default btn-sm">Cancel</button> <button class="widget-action widget-confirm btn btn-primary btn-sm">Confirm</button>',
            searchBoxTemplate: '<input type="search" class="form-control widget-search-input" placeholder="Filter options" />',
            choiceContainerTemplate: '<div class="choice-box"><div class="choice-items"></div></div>',
            choiceItemTemplate: '<div class="choice-item"><i></i></div>',
        }
    };

    // --- Core Widget Class ---
    class SelectorWidget {
        constructor(hostElement, userConfig) {
            this.instanceId = ++uniqueInstanceCounter;
            this.hostElement = hostElement;
            this.hostElement.classList.add('widget-host');
            this.boundHandlers = new Map(); // Store event listeners to manage removal

            this.config = Object.assign({}, standardSettings, userConfig);
            this.config.layoutOptions = Object.assign({}, standardSettings.layoutOptions, this.config.layoutOptions);

            this.displayPanel = null;
            this.choiceGrid = null;
            this.entryField = null;
            this.triggerButton = null;
            this.wrapperHost = null;
            this.currentSelectionValue = null; // Replaces pickerValue

            this.setupInterface();
            this.locateAssociatedElements();
            this.registerInteraction();
            this.updateDisplay(this.config.initialSelection); // Initial value setting
            this.emitEvent('widgetInitialized');

            if (this.isFixedLayout()) {
                this.showPanel();
            }
        }

        // --- Private/Internal Methods ---

        emitEvent(eventName, details = {}) {
            this.hostElement.dispatchEvent(new CustomEvent(eventName, {
                detail: Object.assign({ instance: this }, details),
                bubbles: true
            }));
        }

        createElementFromHTML(htmlString) {
            const div = document.createElement('div');
            div.innerHTML = htmlString.trim();
            return div.firstChild;
        }

        setupInterface() {
            this.displayPanel = this.createElementFromHTML(this.config.layoutOptions.panelTemplate);
            this.choiceGrid = this.createElementFromHTML(this.config.layoutOptions.choiceContainerTemplate);

            const headerSection = this.displayPanel.querySelector('.panel-header');
            const bodySection = this.displayPanel.querySelector('.panel-body');

            if (this.config.label) {
                const titleText = document.createElement('div');
                titleText.classList.add('panel-title-text');
                titleText.textContent = this.config.label;
                headerSection.appendChild(titleText);
            }

            if (!this.config.searchInControls && !checkNullOrEmpty(this.config.layoutOptions.searchBoxTemplate)) {
                headerSection.appendChild(this.createElementFromHTML(this.config.layoutOptions.searchBoxTemplate));
            } else if (!this.config.label) {
                headerSection.remove(); // Remove header if no title and search is in footer
            }

            if (this.config.showControls && !checkNullOrEmpty(this.config.layoutOptions.controlPanelTemplate)) {
                const controlPanel = this.createElementFromHTML(this.config.layoutOptions.controlPanelTemplate);
                if (!checkNullOrEmpty(this.config.layoutOptions.searchBoxTemplate) && this.config.searchInControls) {
                    controlPanel.appendChild(this.createElementFromHTML(this.config.layoutOptions.searchBoxTemplate));
                }
                if (!checkNullOrEmpty(this.config.layoutOptions.actionButtonsTemplate)) {
                    controlPanel.appendChild(this.createElementFromHTML(this.config.layoutOptions.actionButtonsTemplate));
                }
                this.displayPanel.appendChild(controlPanel);
            }

            if (this.config.animatePanel) {
                this.displayPanel.classList.add('fade-animation');
            }

            const choiceItemsContainer = this.choiceGrid.querySelector('.choice-items');
            this.config.availableChoices.forEach(itemValue => {
                const choiceItem = this.createElementFromHTML(this.config.layoutOptions.choiceItemTemplate);
                choiceItem.querySelector('i').textContent = itemValue;
                choiceItem.dataset.choiceValue = itemValue; // Store value in dataset
                choiceItemsContainer.appendChild(choiceItem);
            });

            bodySection.appendChild(this.choiceGrid);

            // Append to DOM
            this.wrapperHost = (this.config.parentContainer && elementExists(document.querySelector(this.config.parentContainer))) ?
                document.querySelector(this.config.parentContainer) :
                (this.hostElement.tagName === 'INPUT' ? this.hostElement.parentNode : this.hostElement);

            this.wrapperHost.classList.add('widget-wrapper');
            if (this.wrapperHost.classList.contains('dropdown-menu')) {
                this.config.displayMode = 'inline';
            }

            if (this.wrapperHost.classList.contains('input-group')) {
                this.wrapperHost.parentNode.appendChild(this.displayPanel);
            } else {
                this.wrapperHost.appendChild(this.displayPanel);
            }
        }

        locateAssociatedElements() {
            this.entryField = (this.hostElement.tagName === 'INPUT' ? this.hostElement : null);
            if (!this.entryField) {
                this.entryField = this.wrapperHost.querySelector(this.config.inputSelector);
            }
            if (this.entryField) {
                this.entryField.classList.add('widget-input');
            }

            this.triggerButton = this.wrapperHost.querySelector(this.config.triggerSelector);
            if (this.triggerButton) {
                this.triggerButton.classList.add('widget-trigger');
            }
        }

        registerInteraction() {
            const searchInput = this.displayPanel.querySelector('.widget-search-input');
            if (searchInput) {
                this.bindEvent(searchInput, 'keyup', (e) => this.filterChoices(e.target.value.toLowerCase()));
            }

            const confirmBtn = this.displayPanel.querySelector('.widget-confirm');
            if (confirmBtn) {
                this.bindEvent(confirmBtn, 'click', () => {
                    this.updateDisplay(this.currentSelectionValue); // Commit the 'pending' selection
                    this.emitEvent('choiceConfirmed', { selectedValue: this.currentSelectionValue });
                    if (!this.isFixedLayout()) {
                        this.hidePanel();
                    }
                });
            }

            const cancelBtn = this.displayPanel.querySelector('.widget-cancel');
            if (cancelBtn) {
                this.bindEvent(cancelBtn, 'click', () => {
                    if (!this.isFixedLayout()) {
                        this.hidePanel();
                    }
                });
            }

            const choiceItems = this.choiceGrid.querySelectorAll('.choice-item');
            choiceItems.forEach(item => {
                this.bindEvent(item, 'click', (e) => {
                    let targetItem = e.target;
                    if (targetItem.tagName === 'I') {
                        targetItem = targetItem.parentNode;
                    }

                    const selectedVal = targetItem.dataset.choiceValue;
                    this.emitEvent('choiceSelected', { chosenItem: targetItem, chosenValue: selectedVal });

                    if (!this.config.requireConfirmation) {
                        this.updateDisplay(selectedVal);
                        this.emitEvent('choiceFinalized', { chosenItem: targetItem, chosenValue: selectedVal });
                    } else {
                        // Store pending selection if confirmation is required
                        this.currentSelectionValue = selectedVal;
                        this.highlightItem(selectedVal);
                    }

                    if (this.config.concealOnChoose && !this.config.requireConfirmation) {
                        this.hidePanel();
                    }
                });
            });

            this.bindEvent(this.hostElement, 'focus', () => this.showPanel());

            if (this.triggerButton) {
                this.bindEvent(this.triggerButton, 'click', () => this.togglePanel());
            }

            if (this.entryField) {
                this.bindEvent(this.entryField, 'keyup', (e) => {
                    // Ignore navigation/modifier keys
                    const ignoredKeys = [38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86];
                    if (!listContains(e.keyCode, ignoredKeys)) {
                        this.updateDisplay(e.target.value);
                    } else {
                        // Validate input field if it's an input and key is ignored
                        this.validateInput(e.target.value);
                    }
                });
            }

            this.bindEvent(window, 'resize', () => {
                if (this.displayPanel.classList.contains('is-visible')) {
                    this.repositionPanel();
                }
            }, window); // Pass window as element for window events

            if (!this.isFixedLayout()) {
                this.bindEvent(document, 'mouseup', (e) => {
                    if (!this.isClickInsideWidget(e) && this.displayPanel.classList.contains('is-visible')) {
                        this.hidePanel();
                    }
                }, document); // Pass document as element for document events
            }
        }

        releaseInteraction() {
            this.boundHandlers.forEach((handler, { element, eventName }) => {
                element.removeEventListener(eventName, handler);
            });
            this.boundHandlers.clear();
        }

        bindEvent(element, eventName, handler, target = element) {
            const boundHandler = handler.bind(this);
            target.addEventListener(eventName, boundHandler);
            // Store a reference to the handler and its context for unbinding
            this.boundHandlers.set({ element: target, eventName: eventName, originalHandler: handler }, boundHandler);
        }

        isClickInsideWidget(event) {
            const target = event.target;
            return this.hostElement.contains(target) || this.displayPanel.contains(target);
        }

        isFixedLayout() {
            return this.config.displayMode === 'inline';
        }

        validateInput(value) {
            // Simple validation: check if value is among available choices
            const isValid = listContains(value, this.config.availableChoices);
            if (this.entryField) {
                this.entryField.classList.toggle('is-invalid', !isValid);
                this.entryField.classList.toggle('is-valid', isValid);
            }
            return isValid;
        }

        // --- Public Methods ---

        showPanel() {
            if (this.displayPanel.classList.contains('is-visible')) return;
            this.displayPanel.classList.add('is-visible');
            this.repositionPanel();
            this.emitEvent('widgetShown');
        }

        hidePanel() {
            if (!this.displayPanel.classList.contains('is-visible')) return;
            this.displayPanel.classList.remove('is-visible');
            this.emitEvent('widgetHidden');
        }

        togglePanel() {
            if (this.displayPanel.classList.contains('is-visible')) {
                this.hidePanel();
            } else {
                this.showPanel();
            }
        }

        updateDisplay(newValue, forceUpdate = false) {
            const resolvedValue = newValue !== null ? newValue :
                                (this.entryField ? this.entryField.value : null);

            let valueToSet = null;
            if (resolvedValue !== null && listContains(resolvedValue, this.config.availableChoices)) {
                valueToSet = resolvedValue;
            } else if (this.config.fallbackValue !== null && listContains(this.config.fallbackValue, this.config.availableChoices)) {
                valueToSet = this.config.fallbackValue;
            } else if (this.config.availableChoices.length > 0) {
                valueToSet = this.config.availableChoices[0]; // Default to first item if all else fails
            }

            if (valueToSet !== null) {
                this.currentSelectionValue = valueToSet;
                if (this.entryField) {
                    this.entryField.value = valueToSet;
                    this.validateInput(valueToSet);
                }
                this.highlightItem(valueToSet);
            } else {
                this.currentSelectionValue = null;
                if (this.entryField) {
                    this.entryField.value = '';
                    this.validateInput('');
                }
                this.removeHighlight();
            }

            this.emitEvent('widgetUpdated', { newValue: this.currentSelectionValue });
        }

        highlightItem(value) {
            this.choiceGrid.querySelectorAll('.choice-item').forEach(item => {
                item.classList.remove(this.config.selectedHighlightClass);
            });
            const selectedItem = this.choiceGrid.querySelector(`[data-choice-value="${value}"]`);
            if (selectedItem) {
                selectedItem.classList.add(this.config.selectedHighlightClass);
            }
        }

        removeHighlight() {
            this.choiceGrid.querySelectorAll('.choice-item').forEach(item => {
                item.classList.remove(this.config.selectedHighlightClass);
            });
        }

        filterChoices(query) {
            this.choiceGrid.querySelectorAll('.choice-item').forEach(item => {
                const itemText = item.querySelector('i').textContent.toLowerCase();
                if (itemText.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        repositionPanel(mode = this.config.displayMode, enableCollision = this.config.avoidCollision) {
            if (mode === 'inline') {
                this.displayPanel.classList.add('inline-layout');
                return;
            }
            this.displayPanel.classList.remove('inline-layout');

            const referenceElement = this.entryField || this.wrapperHost;
            if (!referenceElement) {
                raiseError('Cannot reposition panel: No reference element found (input or container).');
                return;
            }

            const refRect = referenceElement.getBoundingClientRect();
            const panelRect = this.displayPanel.getBoundingClientRect();
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            let panelTop = 0;
            let panelLeft = 0;
            let actualMode = mode;

            const margin = 5; // Small margin for spacing

            const calculatePosition = (currentMode) => {
                switch (currentMode) {
                    case 'top':
                        panelTop = refRect.top - panelRect.height - margin;
                        panelLeft = refRect.left + (refRect.width - panelRect.width) / 2;
                        break;
                    case 'bottom':
                        panelTop = refRect.bottom + margin;
                        panelLeft = refRect.left + (refRect.width - panelRect.width) / 2;
                        break;
                    case 'left':
                        panelTop = refRect.top + (refRect.height - panelRect.height) / 2;
                        panelLeft = refRect.left - panelRect.width - margin;
                        break;
                    case 'right':
                        panelTop = refRect.top + (refRect.height - panelRect.height) / 2;
                        panelLeft = refRect.right + margin;
                        break;
                    default: // Default to bottom
                        panelTop = refRect.bottom + margin;
                        panelLeft = refRect.left + (refRect.width - panelRect.width) / 2;
                        currentMode = 'bottom';
                }
                return { top: panelTop, left: panelLeft, mode: currentMode };
            };

            let pos = calculatePosition(mode);
            panelTop = pos.top;
            panelLeft = pos.left;
            actualMode = pos.mode;

            // Collision detection and adjustment
            if (enableCollision) {
                // Check vertical collision
                if (panelTop < 0 && (actualMode.includes('top') || actualMode.includes('bottom'))) { // Collides with top of viewport
                    if (actualMode.includes('top') && (refRect.bottom + panelRect.height + margin) <= viewportHeight) {
                        pos = calculatePosition('bottom');
                        panelTop = pos.top;
                        actualMode = 'bottom';
                    } else if (actualMode.includes('bottom') && (refRect.top - panelRect.height - margin) >= 0) {
                        pos = calculatePosition('top');
                        panelTop = pos.top;
                        actualMode = 'top';
                    }
                } else if ((panelTop + panelRect.height) > viewportHeight && (actualMode.includes('top') || actualMode.includes('bottom'))) { // Collides with bottom of viewport
                    if (actualMode.includes('bottom') && (refRect.top - panelRect.height - margin) >= 0) {
                        pos = calculatePosition('top');
                        panelTop = pos.top;
                        actualMode = 'top';
                    } else if (actualMode.includes('top') && (refRect.bottom + panelRect.height + margin) <= viewportHeight) {
                        pos = calculatePosition('bottom');
                        panelTop = pos.top;
                        actualMode = 'bottom';
                    }
                }

                // Re-calculate left based on potentially changed vertical mode
                pos = calculatePosition(actualMode);
                panelLeft = pos.left;

                // Check horizontal collision
                if (panelLeft < 0) { // Collides with left of viewport
                    panelLeft = margin; // Align to left edge
                } else if ((panelLeft + panelRect.width) > viewportWidth) { // Collides with right of viewport
                    panelLeft = viewportWidth - panelRect.width - margin; // Align to right edge
                }
            }

            // Apply styles
            this.displayPanel.style.position = 'absolute';
            this.displayPanel.style.top = `${panelTop + window.scrollY}px`;
            this.displayPanel.style.left = `${panelLeft + window.scrollX}px`;
            this.displayPanel.dataset.currentPlacement = actualMode; // For CSS arrow positioning
        }


        destroy() {
            this.releaseInteraction();
            this.displayPanel.remove();
            this.hostElement.classList.remove('widget-host');
            if (this.entryField) this.entryField.classList.remove('widget-input', 'is-valid', 'is-invalid');
            if (this.triggerButton) this.triggerButton.classList.remove('widget-trigger');
            if (this.wrapperHost) this.wrapperHost.classList.remove('widget-wrapper');
            instanceMap.delete(this.hostElement);
            this.emitEvent('widgetDestroyed');
        }
    }

    // --- Global Interface ---

    /**
     * Initializes SelectorWidget instances on matching elements.
     * @param {string} selector - CSS selector for host elements.
     * @param {object} [options={}] - Configuration options for the widget.
     * @returns {SelectorWidget|SelectorWidget[]} Single instance or array of instances.
     */
    window.initializeSelectorWidgets = function(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        const instances = [];
        elements.forEach(element => {
            if (!instanceMap.has(element)) {
                const newWidget = new SelectorWidget(element, options);
                instanceMap.set(element, newWidget);
                instances.push(newWidget);
            } else {
                instances.push(instanceMap.get(element));
            }
        });
        return instances.length === 1 ? instances[0] : instances;
    };

    /**
     * Manages existing SelectorWidget instances by calling a method on them.
     * @param {string} selector - CSS selector for host elements.
     * @param {string} methodName - The name of the method to call.
     * @param {...any} args - Arguments to pass to the method.
     */
    window.controlSelectorWidgets = function(selector, methodName, ...args) {
        document.querySelectorAll(selector).forEach(element => {
            const instance = instanceMap.get(element);
            if (instance && typeof instance[methodName] === 'function') {
                instance[methodName](...args);
            }
        });
    };

    // Make SelectorWidget class accessible if needed for advanced customization
    window.SelectorWidgetClass = SelectorWidget;

})();