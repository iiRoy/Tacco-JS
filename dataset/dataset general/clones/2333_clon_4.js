(function (HotTableLib) {
    "use strict";

    // Custom utility for basic DOM operations, replacing Handsontable.Dom
    const DomManipulator = {
        applyClass: (element, className) => element.classList.add(className),
        removeClass: (element, className) => element.classList.remove(className),
        fetchOffset: (element) => $(element).offset(), // Requires jQuery, like original
        fetchOuterWidth: (element) => $(element).outerWidth(),
        fetchHeight: (element) => $(element).height()
    };

    // A structured map for special keyboard input processing, replacing switch-case
    const KeyboardActionRegistry = new Map([
        [HotTableLib.helper.keyCode.ENTER, 'handleEnterKey'],
        [HotTableLib.helper.keyCode.A, 'handleCtrlCombo'],
        [HotTableLib.helper.keyCode.X, 'handleCtrlCombo'],
        [HotTableLib.helper.keyCode.C, 'handleCtrlCombo'],
        [HotTableLib.helper.keyCode.V, 'handleCtrlCombo'],
        [HotTableLib.helper.keyCode.HOME, 'preventPropagation'],
        [HotTableLib.helper.keyCode.END, 'preventPropagation'],
        [17, 'ignoreKey'], // CTRL
        [224, 'ignoreKey'], // CMD (Firefox)
        [91, 'ignoreKey'], // Left CMD (Safari/Chrome)
        [93, 'ignoreKey'] // Right CMD (Safari/Chrome)
    ]);

    // Alias for the base text editor class for clarity and renaming
    class BaseTextCellModifier extends HotTableLib.editors.TextEditor {}

    class EnhancedDropdownCellEditor extends BaseTextCellModifier {
        constructor(contextInstance) {
            super(contextInstance); // Initialize the base editor
            this._hotContext = contextInstance; // Reference to the Handsontable instance
            this._domManipulator = DomManipulator; // Our custom DOM utility
            this._componentConfiguration = {}; // Stores select2 specific settings
            this._jqueryWrappedInput = null; // jQuery-wrapped input element
            this._rawInputElement = null; // The native HTML input element
            this._inputContainerDiv = null; // The native HTML div container
            this._containerDivStyle = null; // Style object for the container
            this._inputElementStyle = null; // Style object for the input
            this._currentCellReference = null; // Reference to the TD element being edited
            this._initialValueOnStart = ''; // Value when editing was initiated
            this._documentBodyRef = $(document.body); // jQuery reference to body
            this._activeKeyHookId = null; // ID for the instance-specific keydown hook
        }

        // Replaces original 'prepare' method
        configureEditor(targetCell, rowIndex, colIndex, dataProperty, initialValue, cellFeatures) {
            super.prepare(targetCell, rowIndex, colIndex, dataProperty, initialValue, cellFeatures);

            this._componentConfiguration = {}; // Reset settings
            if (cellFeatures && cellFeatures.dropdownConfiguration) {
                // Use Object.assign for merging, replacing $.extend
                Object.assign(this._componentConfiguration, cellFeatures.dropdownConfiguration);
            }
            this._currentCellReference = targetCell;
            this._initialValueOnStart = initialValue;
        }

        // Replaces original 'createElements' method
        buildInterface() {
            // Create the primary input control
            this._rawInputElement = document.createElement('input');
            this._rawInputElement.setAttribute('type', 'text');
            this._jqueryWrappedInput = $(this._rawInputElement);
            this._domManipulator.applyClass(this._rawInputElement, 'handsontableInput');

            this._inputElementStyle = this._rawInputElement.style;
            this._inputElementStyle.width = '0px';
            this._inputElementStyle.height = '0px';

            // Create the parent container for the input
            this._inputContainerDiv = document.createElement('DIV');
            this._domManipulator.applyClass(this._inputContainerDiv, 'handsontableInputHolder');

            this._containerDivStyle = this._inputContainerDiv.style;
            this._containerDivStyle.top = '0px';
            this._containerDivStyle.left = '0px';
            this._containerDivStyle.display = 'none';

            this._inputContainerDiv.appendChild(this._rawInputElement);

            // Append to the root DOM element of the Handsontable instance
            this._hotContext.rootElement[0].appendChild(this._inputContainerDiv);

            // Add a global hook for after rendering, using arrow function for context
            HotTableLib.PluginHooks.add('afterRender', () => {
                this._hotContext.registerTimeout('editor_layout_update', () => {
                    this.adjustVisualLayout();
                }, 0);
            });
        }

        // Replaces original 'open' method
        activateEditor() {
            this._containerDivStyle.display = 'block';
            // Attach instance-specific keydown hook
            this._activeKeyHookId = this._hotContext.addHook('beforeKeyDown', this._processKeyPress.bind(this));

            const cellMetrics = {
                width: this._domManipulator.fetchOuterWidth(this._currentCellReference),
                height: this._domManipulator.fetchHeight(this._currentCellReference)
            };

            this._jqueryWrappedInput.css({
                height: cellMetrics.height,
                'min-width': cellMetrics.width
            });

            this._jqueryWrappedInput.show();
            this._jqueryWrappedInput.offset(this._domManipulator.fetchOffset(this._currentCellReference));

            // Initialize select2 and bind custom events
            this._jqueryWrappedInput.select2(this._componentConfiguration)
                .on('change', this._handleSelectComponentChange.bind(this))
                .on('select2-close', this._handleSelectComponentClose.bind(this))
                .on('select2-open', (event) => {
                    const searchInput = $('.select2-drop-active .select2-search .select2-input');
                    searchInput.val(this._jqueryWrappedInput.val()).trigger('paste');
                });

            setTimeout(() => {
                this._jqueryWrappedInput.select2('focus');
                this._jqueryWrappedInput.select2('container').find('.select2-choice').trigger('mousedown').trigger('mouseup');
            }, 50);
        }

        // Replaces original 'close' method
        deactivateEditor() {
            this._hotContext.listen(); // Restore Handsontable's event listening
            if (this._activeKeyHookId) {
                this._hotContext.removeHook('beforeKeyDown', this._activeKeyHookId);
                this._activeKeyHookId = null;
            }
            this._jqueryWrappedInput.off(); // Unbind all jQuery events
            this._jqueryWrappedInput.hide();
            super.close(); // Call base editor's close method
        }

        // Replaces original 'val' method for getting/setting content
        retrieveContent(newContent) {
            if (typeof newContent === 'undefined') {
                return this._jqueryWrappedInput.val();
            }
            this._jqueryWrappedInput.val(newContent);
        }

        assignContent(newContent) {
            this.retrieveContent(newContent);
        }

        // Replaces original 'focus' method
        focusControl() {
            this._hotContext.listen();
            // Intentionally omit calling super.focus() as per original editor's comment
        }

        // Replaces original 'beginEditing' method
        initiateEdit(startingValue) {
            const preEditHook = this._hotContext.getSettings().onBeginEditing;
            if (preEditHook && preEditHook() === false) {
                return;
            }
            super.beginEditing(startingValue);
        }

        // Replaces original 'finishEditing' method
        completeEdit(wasCancelled, ctrlPressed) {
            this._hotContext.listen();
            return super.finishEditing(wasCancelled, ctrlPressed);
        }

        // Replaces original 'refreshDimensions' logic
        adjustVisualLayout() {
            if (this.isOpened()) {
                const cellPosition = this._domManipulator.fetchOffset(this.TD);
                const cellWidth = this._domManipulator.fetchOuterWidth(this.TD);
                const cellHeight = this._domManipulator.fetchHeight(this.TD);

                this._containerDivStyle.top = `${cellPosition.top}px`;
                this._containerDivStyle.left = `${cellPosition.left}px`;
                this._containerDivStyle.width = `${cellWidth}px`;
                this._containerDivStyle.height = `${cellHeight}px`;

                this._jqueryWrappedInput.css({
                    height: cellHeight,
                    'min-width': cellWidth
                });
            }
        }

        // Private handler for select2 'change' event
        _handleSelectComponentChange() {
            this.deactivateEditor();
            this.completeEdit();
        }

        // Private handler for select2 'select2-close' event
        _handleSelectComponentClose() {
            this.deactivateEditor();
            this.completeEdit();
        }

        // Private handler for keyboard events, replacing 'onBeforeKeyDown'
        _processKeyPress(event) {
            const currentlyActiveEditor = this._hotContext.getActiveEditor();

            // Only process events originating from this specific editor's input
            if (event.target !== currentlyActiveEditor._rawInputElement || event.isImmediatePropagationStopped()) {
                return;
            }

            const isCtrlOrMeta = (event.ctrlKey || event.metaKey) && !event.altKey;
            const registeredAction = KeyboardActionRegistry.get(event.keyCode);

            switch (registeredAction) {
                case 'ignoreKey':
                    event.stopImmediatePropagation();
                    return;
                case 'handleCtrlCombo':
                    if (isCtrlOrMeta) {
                        event.stopImmediatePropagation();
                    }
                    return; // Return after handling, do not fall through
                case 'preventPropagation':
                    event.stopImmediatePropagation();
                    return;
                case 'handleEnterKey':
                    const selectionBounds = currentlyActiveEditor._hotContext.getSelected();
                    const isMultiCellSelected = !(selectionBounds[0] === selectionBounds[2] && selectionBounds[1] === selectionBounds[3]);

                    if ((isCtrlOrMeta && !isMultiCellSelected) || event.altKey) {
                        if (currentlyActiveEditor.isOpened()) {
                            currentlyActiveEditor.assignContent(currentlyActiveEditor.retrieveContent() + '\n');
                            currentlyActiveEditor.focusControl();
                        } else {
                            currentlyActiveEditor.initiateEdit(currentlyActiveEditor._initialValueOnStart + '\n');
                        }
                        event.stopImmediatePropagation();
                    }
                    event.preventDefault(); // Always prevent default ENTER behavior for this editor
                    break;
                default:
                    // No specific action defined for this key
                    break;
            }
        }
    }

    // Register the new editor with Handsontable
    HotTableLib.editors.EnhancedDropdownCellEditor = EnhancedDropdownCellEditor;
    HotTableLib.editors.registerEditor('enhancedDropdown', EnhancedDropdownCellEditor);

})(Handsontable);