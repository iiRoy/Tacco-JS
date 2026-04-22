(function (DataGridCore) {
    "use strict"; // Enforce stricter parsing and error handling for better code quality

    // Define a new cell editor by extending the base text input editor provided by the data grid.
    // This editor will integrate with a third-party dropdown library.
    var DropdownInputCellEditor = DataGridCore.editors.BasicTextInputEditor.prototype.extend();

    /**
     * Initializes the dropdown editor for a specific cell.
     * This method is called before the editor is opened.
     * @param {HTMLElement} targetCellElement - The DOM element of the cell being edited.
     * @param {number} rowIndex - The row index of the cell.
     * @param {number} columnIndex - The column index of the cell.
     * @param {string} dataProperty - The property name corresponding to the cell's data.
     * @param {*} initialCellValue - The initial value of the cell.
     * @param {object} cellConfiguration - Configuration object for the cell, including editor options.
     */
    DropdownInputCellEditor.prototype.prepare = function (targetCellElement, rowIndex, columnIndex, dataProperty, initialCellValue, cellConfiguration) {
        // Invoke the preparation logic of the base text input editor.
        DataGridCore.editors.BasicTextInputEditor.prototype.prepare.apply(this, arguments);

        // Initialize editor-specific options.
        this._dropdownOptions = {};

        // If specific dropdown options are provided in the cell configuration, merge them.
        if (cellConfiguration && cellConfiguration.dropdownSettings) {
            this._dropdownOptions = Object.assign({}, this._dropdownOptions, cellConfiguration.dropdownSettings);
        }

        // Store the full configuration for later use.
        this.currentCellConfig = cellConfiguration;
    };

    /**
     * Creates and initializes the DOM elements required for the dropdown editor.
     * This method is called once when the editor instance is created.
     */
    DropdownInputCellEditor.prototype.createElements = function () {
        // Prevent re-creation if elements already exist.
        if (this._jQueryInput) {
            console.warn("Dropdown editor elements already initialized. Skipping re-creation.");
            return;
        }

        this._pageBody = $(document.body); // Reference to the document body for appending elements.
        this._domUtilities = DataGridCore.Dom; // Utility for DOM manipulation.

        // Create the primary input element (an <input type="text">).
        this._inputElement = document.createElement('input');
        this._inputElement.type = 'text'; // Directly set the type property.
        this._jQueryInput = $(this._inputElement); // Wrap with jQuery for convenience.

        // Add the standard input class for styling.
        this._domUtilities.addClass(this._inputElement, 'dataGridInput');

        // Initial styling for the input element (will be adjusted dynamically).
        this._inputElementStyle = this._inputElement.style;
        this._inputElementStyle.width = '1px'; // Minimal width initially.
        this._inputElementStyle.height = '1px'; // Minimal height initially.

        // Create a parent container for the input element.
        this._inputWrapperDiv = document.createElement('DIV');
        this._domUtilities.addClass(this._inputWrapperDiv, 'dataGridInputContainer');

        // Initial styling for the parent container.
        this._inputWrapperStyle = this._inputWrapperDiv.style;
        this._inputWrapperStyle.position = 'absolute'; // Position absolutely to overlay the cell.
        this._inputWrapperStyle.top = '0';
        this._inputWrapperStyle.left = '0';
        this._inputWrapperStyle.display = 'none'; // Hidden by default.

        // Append the input element to its wrapper.
        this._inputWrapperDiv.appendChild(this._inputElement);

        // Ensure the root element exists before appending.
        if (this.gridInstance && this.gridInstance.rootElement && this.gridInstance.rootElement[0]) {
            this.gridInstance.rootElement[0].appendChild(this._inputWrapperDiv);
        } else {
            console.error("DataGrid root element not found, cannot append editor input wrapper.");
            return;
        }

        // Register a hook to refresh editor dimensions after the grid renders.
        // Using an arrow function to preserve 'this' context.
        DataGridCore.PluginHooks.add('afterRender', () => {
            this.gridInstance.registerTimeout('refresh_dropdown_editor_dims', () => {
                this.refreshDimensions(); // Ensure editor matches cell size.
            }, 0);
        });

        // Initialize a state flag for the editor's open status.
        this.currentEditorState = { isOpen: false };
    };

    /**
     * Handles the 'change' event from the dropdown component.
     * @private
     */
    const handleDropdownValueChange = function () {
        this.close(); // Close the editor.
        this.finishEditing(); // Finalize the editing process.
    };

    /**
     * Handles the 'close' event from the dropdown component.
     * @private
     */
    const handleDropdownComponentClose = function () {
        // Only close and finish if the editor was actually open.
        if (this.currentEditorState.isOpen) {
            this.close();
            this.finishEditing();
        }
    };

    /**
     * Processes keyboard events before they are handled by the grid.
     * Prevents default grid behavior for certain key combinations when the editor is active.
     * @param {KeyboardEvent} keyboardEvent - The keyboard event object.
     * @private
     */
    const handlePreKeystroke = function (keyboardEvent) {
        const activeGridInstance = this; // 'this' refers to the grid instance due to hook binding.
        const currentEditor = activeGridInstance.getActiveEditor();

        // If no editor or if the event didn't originate from *this* editor's input, or already stopped, exit.
        if (!currentEditor || keyboardEvent.target !== currentEditor._inputElement || keyboardEvent.isImmediatePropagationStopped()) {
            return;
        }

        const keyboardEventCodes = DataGridCore.helper.keyCode;
        const controlKeyIsDown = (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && !keyboardEvent.altKey; // CTRL or CMD, but not ALT+CTRL.

        // Ignore modifier keys alone (CTRL, CMD).
        if ([17, 224, 91, 93].includes(keyboardEvent.keyCode)) {
            keyboardEvent.stopImmediatePropagation();
            return;
        }

        let eventHandledByEditor = false;

        switch (keyboardEvent.keyCode) {
            case keyboardEventCodes.ENTER:
                const currentlySelectedRange = currentEditor.gridInstance.getSelected();
                const isMultiCellSelection = !(currentlySelectedRange[0] === currentlySelectedRange[2] && currentlySelectedRange[1] === currentlySelectedRange[3]);

                // If CTRL+ENTER (or CMD+ENTER) and not multi-selection, or ALT+ENTER, add a new line.
                if ((controlKeyIsDown && !isMultiCellSelection) || keyboardEvent.altKey) {
                    if (currentEditor.currentEditorState.isOpen) {
                        currentEditor.val(currentEditor.val() + '\n');
                        currentEditor.focus();
                    } else {
                        // If editor is not open, begin editing with a new line appended to original value.
                        currentEditor.beginEditing(currentEditor.originalValue + '\n');
                    }
                    eventHandledByEditor = true;
                }
                // Prevent default behavior (e.g., moving to next cell) for ENTER.
                keyboardEvent.preventDefault();
                break;

            case keyboardEventCodes.A:
            case keyboardEventCodes.X:
            case keyboardEventCodes.C:
            case keyboardEventCodes.V:
                if (controlKeyIsDown) {
                    // For CTRL+A/X/C/V, allow default behavior within the editor's input field only.
                    eventHandledByEditor = true; // Mark as handled to prevent grid-wide actions.
                }
                break;

            case keyboardEventCodes.HOME:
            case keyboardEventCodes.END:
                // For HOME/END, allow default behavior within the editor's input field only.
                eventHandledByEditor = true; // Mark as handled.
                break;
        }

        // If the editor handled the event, stop propagation to prevent grid-wide keydown hooks from firing.
        if (eventHandledByEditor) {
            keyboardEvent.stopImmediatePropagation();
        }
    };

    /**
     * Opens the dropdown editor.
     * This method makes the editor visible and initializes the dropdown component.
     */
    DropdownInputCellEditor.prototype.open = function () {
        // Ensure elements are created before proceeding.
        if (!this._jQueryInput) {
            console.error("Editor input elements not created. Cannot open editor.");
            return;
        }

        this._inputWrapperStyle.display = 'block'; // Make the editor wrapper visible.
        this.gridInstance.addHook('beforeKeyDown', handlePreKeystroke); // Add the custom keydown handler.

        const currentCell = $(this.TD); // Cache jQuery object for the cell.

        // Adjust the size of the input element to match the cell.
        this._jQueryInput.css({
            height: currentCell.height(),
            'min-width': currentCell.outerWidth()
        });

        // Display the input field.
        this._jQueryInput.show();

        // Position the input field precisely over the cell.
        this._jQueryInput.offset(currentCell.offset());

        // Initialize the dropdown plugin on the input element.
        // Bind custom event handlers for dropdown actions.
        this._jQueryInput.select2(this._dropdownOptions)
            .on('change', handleDropdownValueChange.bind(this))
            .on('select2-close', handleDropdownComponentClose.bind(this))
            .on("select2-open", (event) => {
                // When the dropdown opens, attempt to pre-populate its search box.
                const searchBoxElement = $('.select2-drop-active .select2-search .select2-input');
                if (searchBoxElement.length > 0) {
                    searchBoxElement.val(this._jQueryInput.val()).trigger('paste');
                }
                console.log("Dropdown component opened for cell:", this.rowIndex, this.columnIndex);
            });

        // Set a short delay to ensure the dropdown is fully rendered before attempting to focus.
        setTimeout(() => {
            if (this._jQueryInput.data('select2')) { // Check if select2 is initialized.
                this._jQueryInput.select2('focus');
                // Programmatically trigger the dropdown to open its options list.
                this._jQueryInput.select2('container').find('.select2-choice').trigger('mousedown').trigger('mouseup');
            }
        }, 75); // Slightly increased delay for robustness.

        this.currentEditorState.isOpen = true; // Update editor state.
    };

    /**
     * Closes the dropdown editor.
     * This method hides the editor and cleans up event listeners.
     */
    DropdownInputCellEditor.prototype.close = function () {
        // Ensure elements exist before attempting to close/cleanup.
        if (!this._jQueryInput) {
            console.warn("Editor input elements not found during close operation.");
            return;
        }

        this.gridInstance.listen(); // Re-enable grid's default keyboard listeners.
        this.gridInstance.removeHook('beforeKeyDown', handlePreKeystroke); // Remove the custom keydown handler.

        // Detach all event handlers specific to the dropdown component.
        this._jQueryInput.off('change select2-close select2-open');
        // If select2 is initialized, destroy it to clean up its DOM elements.
        if (this._jQueryInput.data('select2')) {
            this._jQueryInput.select2('destroy');
        }

        this._jQueryInput.hide(); // Hide the input element.
        this._inputWrapperStyle.display = 'none'; // Hide the wrapper div.

        DataGridCore.editors.BasicTextInputEditor.prototype.close.apply(this, arguments); // Call base class close method.
        this.currentEditorState.isOpen = false; // Update editor state.
    };

    /**
     * Gets or sets the value of the editor's input element.
     * @param {*} [newValue] - The value to set. If undefined, returns the current value.
     * @returns {*} The current value of the input element if `newValue` is not provided.
     */
    DropdownInputCellEditor.prototype.val = function (newValue) {
        // Ensure the input element exists before accessing its value.
        if (!this._jQueryInput) {
            console.error("Editor input element not available for value operation.");
            return undefined;
        }

        // Use a ternary operator for concise getter/setter logic.
        return (typeof newValue === 'undefined') ? this._jQueryInput.val() : this._jQueryInput.val(newValue);
    };

    /**
     * Sets focus on the editor's input element.
     * Overrides the base class focus method to avoid unintended behavior.
     */
    DropdownInputCellEditor.prototype.focus = function () {
        this.gridInstance.listen(); // Ensure grid is listening for events.
        // IMPORTANT: The base BasicTextInputEditor's focus method is intentionally NOT called here.
        // Calling it can lead to conflicts or undesirable behavior with the dropdown component's own focus management.
        // This editor relies on the dropdown library to manage focus within its component.
    };

    /**
     * Initiates the editing process for the cell.
     * Includes a custom check before allowing editing to begin.
     * @param {*} initialValueToEdit - The value to populate the editor with initially.
     */
    DropdownInputCellEditor.prototype.beginEditing = function (initialValueToEdit) {
        const onInitiateEditing = this.gridInstance.getSettings().onBeginEditing;

        // Custom validation: if a 'onBeginEditing' hook exists and returns false, prevent editing.
        if (typeof onInitiateEditing === 'function' && onInitiateEditing() === false) {
            console.log("Editing blocked by 'onBeginEditing' hook.");
            return;
        }

        // Call the base class method to continue the editing initiation.
        DataGridCore.editors.BasicTextInputEditor.prototype.beginEditing.apply(this, arguments);
    };

    /**
     * Finalizes the editing process.
     * @param {boolean} [wasCancelled=false] - True if editing was cancelled, false otherwise.
     * @param {boolean} [controlKeyHeld=false] - True if a control key was held during finalization.
     * @returns {boolean} Result of the base class's finishEditing method.
     */
    DropdownInputCellEditor.prototype.finishEditing = function (wasCancelled = false, controlKeyHeld = false) {
        this.gridInstance.listen(); // Ensure the grid is listening for events after editing.
        console.log(`Dropdown editor finished. Cancelled: ${wasCancelled}, Ctrl held: ${controlKeyHeld}`);
        return DataGridCore.editors.BasicTextInputEditor.prototype.finishEditing.apply(this, arguments);
    };

    // Register the custom dropdown editor with the data grid.
    DataGridCore.editors.DropdownInputCellEditor = DropdownInputCellEditor;
    DataGridCore.editors.registerEditor('dropdownCell', DropdownInputCellEditor);

})(Handsontable); // The original global 'Handsontable' object is passed in, but aliased as 'DataGridCore' internally.