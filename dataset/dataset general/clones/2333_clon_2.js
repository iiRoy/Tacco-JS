(function (TableEngine) {
  "use strict";

  // Define a custom editor type for dropdown-like components.
  // This editor extends the base simple text editor provided by the table engine.
  var ChoicePickerEditor = TableEngine.editModules.SimpleTextEditor.prototype.extend();

  /**
   * Initializes the editor for a specific cell.
   * This method sets up the editor's internal state and options based on cell properties.
   * @param {HTMLElement} targetCell - The DOM element of the cell being edited.
   * @param {number} rowIndex - The row index of the cell.
   * @param {number} columnIndex - The column index of the cell.
   * @param {string} propertyKey - The data property key associated with the cell.
   * @param {*} currentValue - The current value of the cell.
   * @param {object} cellSettings - All properties defined for the cell.
   */
  ChoicePickerEditor.prototype.setupEditorState = function (targetCell, rowIndex, columnIndex, propertyKey, currentValue, cellSettings) {
    // Call the parent editor's prepare method to inherit basic setup.
    TableEngine.editModules.SimpleTextEditor.prototype.setupEditorState.apply(this, arguments);

    // Initialize editor-specific configuration options.
    this.componentOptions = {};

    // If the cell has custom dropdown options, merge them.
    if (this.cellSettings.pickerOptions) {
      this.componentOptions = $.extend(this.componentOptions, cellSettings.pickerOptions);
    }
  };

  /**
   * Constructs the necessary DOM elements for the editor interface.
   * This includes the input field and its containing wrapper.
   */
  ChoicePickerEditor.prototype.constructUi = function () {
    // Cache a reference to the document body for appending elements.
    this.$docBody = $(document.body);
    // Get the DOM manipulation utilities from the table engine.
    this.domUtils = TableEngine.DomHelpers;

    // Create the primary input element for the editor.
    this.INPUT_FIELD = document.createElement('input');
    this.INPUT_FIELD.setAttribute('type', 'text');
    // Wrap the input field with jQuery for easier manipulation.
    this.$inputField = $(this.INPUT_FIELD);

    // Apply the standard input class for styling.
    this.domUtils.addClass(this.INPUT_FIELD, 'tableInputControl');

    // Store a direct reference to the input field's style object.
    this.inputFieldStyle = this.INPUT_FIELD.style;
    // Initially hide the input field by setting its dimensions to zero.
    this.inputFieldStyle.width = 0;
    this.inputFieldStyle.height = 0;

    // Create a parent container for the input field.
    this.INPUT_CONTAINER = document.createElement('DIV');
    // Add a class to the container for specific styling.
    this.domUtils.addClass(this.INPUT_CONTAINER, 'tableInputWrapper');

    // Store a direct reference to the container's style object.
    this.inputContainerStyle = this.INPUT_CONTAINER.style;
    // Set initial positioning and hide the container.
    this.inputContainerStyle.top = 0;
    this.inputContainerStyle.left = 0;
    this.inputContainerStyle.display = 'none';

    // Append the input field to its container.
    this.INPUT_CONTAINER.appendChild(this.INPUT_FIELD);

    // Append the container to the grid's root element.
    this.instanceRef.baseElement[0].appendChild(this.INPUT_CONTAINER);

    // Create a self-reference for use within closures.
    var selfRef = this;
    // Add a hook to re-evaluate editor dimensions after the grid renders.
    TableEngine.EventHooks.register('afterGridRender', function () {
      selfRef.instanceRef.registerTimeout('update_editor_size_delay', function () {
        selfRef.adjustDimensions();
      }, 0);
    });
  };

  /**
   * Handler for when the dropdown component's value changes.
   * Closes the editor and finalizes the editing process.
   */
  var handlePickerChange = function () {
    this.shutDown();
    this.completeEdit();
  };

  /**
   * Handler for when the dropdown component is closed.
   * Closes the editor and finalizes the editing process.
   */
  var handlePickerClose = function () {
    this.shutDown();
    this.completeEdit();
  };

  /**
   * Intercepts keydown events to handle specific editor behaviors.
   * @param {KeyboardEvent} keyboardEvent - The keyboard event object.
   */
  var onKeyPrePress = function onKeyPrePress(keyboardEvent) {
    // Get the current grid instance and the active editor.
    var gridInstance = this;
    var currentEditor = gridInstance.retrieveActiveEditor();

    // Access predefined keyboard codes for comparison.
    var keyboardCodes = TableEngine.utility.keyConstants;
    // Determine if the control key (or equivalent) is pressed, excluding right ALT.
    var controlKeyPressed = (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && !keyboardEvent.altKey;

    // Only process events that originated from this editor's input field
    // and have not been stopped by other handlers.
    if (keyboardEvent.target !== currentEditor.INPUT_FIELD || keyboardEvent.isImmediatePropagationStopped()) {
      return;
    }

    // Ignore specific control key presses (CTRL, CMD) to prevent unwanted actions.
    if (keyboardEvent.keyCode === 17 || keyboardEvent.keyCode === 224 || keyboardEvent.keyCode === 91 || keyboardEvent.keyCode === 93) {
      keyboardEvent.stopImmediatePropagation();
      return;
    }

    // Handle different key presses based on their code.
    switch (keyboardEvent.keyCode) {
      case keyboardCodes.ENTER_KEY:
        var currentSelection = currentEditor.instanceRef.getCurrentSelection();
        // Check if multiple cells are selected.
        var isRangeSelected = !(currentSelection[0] === currentSelection[2] && currentSelection[1] === currentSelection[3]);

        // If Ctrl+Enter or Alt+Enter, add a new line within the editor.
        if ((controlKeyPressed && !isRangeSelected) || keyboardEvent.altKey) {
          if (currentEditor.isEditorActive()) {
            currentEditor.getSetValue(currentEditor.getSetValue() + '\n');
            currentEditor.setFocus();
          } else {
            currentEditor.startEditing(currentEditor.initialCellValue + '\n')
          }
          keyboardEvent.stopImmediatePropagation();
        }
        // Prevent the default Enter key action (e.g., form submission, new line in non-textarea).
        keyboardEvent.preventDefault();
        break;

      case keyboardCodes.KEY_A:
      case keyboardCodes.KEY_X:
      case keyboardCodes.KEY_C:
      case keyboardCodes.KEY_V:
        // If Ctrl is pressed, allow these actions locally within the editor
        // but prevent them from propagating to the grid context.
        if (controlKeyPressed) {
          keyboardEvent.stopImmediatePropagation();
          break;
        }
      case keyboardCodes.HOME_KEY:
      case keyboardCodes.END_KEY:
        // Prevent Home/End keys from scrolling the grid when editing.
        keyboardEvent.stopImmediatePropagation();
        break;
    }
  };

  /**
   * Activates and displays the dropdown editor.
   */
  ChoicePickerEditor.prototype.displayControl = function () {
    // Make the editor container visible.
    this.inputContainerStyle.display = 'block';
    // Add the custom keydown handler to the grid instance.
    this.instanceRef.addEventHook('onKeyPrePress', onKeyPrePress);

    // Adjust the input field's size to match the cell.
    this.$inputField.css({
      height: $(this.targetCell).height(),
      'min-width': $(this.targetCell).outerWidth()
    });

    // Ensure the input field is displayed.
    this.$inputField.show();

    // Position the input field precisely over the target cell.
    this.$inputField.offset($(this.targetCell).offset());

    // Store a reference to 'this' for use in event handlers.
    const editorContext = this;
    // Initialize the custom dropdown component on the input field
    // and attach event listeners for changes, closing, and opening.
    this.$inputField.customDropdown(this.componentOptions)
      .on('valueChange', handlePickerChange.bind(this))
      .on('dropdownClosed', handlePickerClose.bind(this))
      .on("dropdownOpen", function (eventData) {
        // When the dropdown opens, find its search input and populate it
        // with the current editor value, then trigger a paste event.
        var searchField = $('.custom-dropdown-open .custom-dropdown-search .custom-dropdown-input');
        searchField.val(editorContext.getSetValue()).trigger('paste');
      });

    // Set a timeout to focus the dropdown after it has rendered,
    // and simulate a click on the dropdown toggle to open it fully.
    setTimeout(function () {
      editorContext.$inputField.customDropdown('focus');
      editorContext.$inputField.customDropdown('wrapper').find('.custom-dropdown-toggle').trigger('mousedown').trigger('mouseup');
    }, 50);
  };

  /**
   * Deactivates and hides the dropdown editor.
   */
  ChoicePickerEditor.prototype.shutDown = function () {
    // Resume normal keyboard listening for the grid.
    this.instanceRef.resumeListening();
    // Remove the custom keydown hook.
    this.instanceRef.removeEventHook('onKeyPrePress', onKeyPrePress);
    // Unbind all events from the input field.
    this.$inputField.off();
    // Hide the input field.
    this.$inputField.hide();
    // Call the parent editor's close method for cleanup.
    TableEngine.editModules.SimpleTextEditor.prototype.shutDown.apply(this, arguments);
  };

  /**
   * Gets or sets the value of the editor's input field.
   * @param {*} [inputValue] - The value to set. If undefined, returns the current value.
   * @returns {*} The current value of the input field.
   */
  ChoicePickerEditor.prototype.getSetValue = function (inputValue) {
    if (typeof inputValue === 'undefined') {
      return this.$inputField.val();
    } else {
      this.$inputField.val(inputValue);
    }
  };

  /**
   * Sets focus to the editor's input field.
   */
  ChoicePickerEditor.prototype.setFocus = function () {
    // Ensure the grid instance listens for events while the editor is active.
    this.instanceRef.resumeListening();

    // IMPORTANT: Do not call the base editor's focus method here.
    // It can interfere with the custom dropdown component's focus behavior
    // and is not required for this specific editor's functionality.
    // TableEngine.editModules.SimpleTextEditor.prototype.setFocus.apply(this, arguments);
  };

  /**
   * Initiates the editing process for the cell.
   * @param {*} startingValue - The initial value to populate the editor with.
   */
  ChoicePickerEditor.prototype.startEditing = function (startingValue) {
    // Check for a custom 'onStartEdit' callback defined in grid settings.
    var onStartCallback = this.instanceRef.getGridOptions().onStartEdit;
    if (onStartCallback && onStartCallback() === false) {
      return; // If callback returns false, prevent editing.
    }

    // Call the base text editor's beginEditing method.
    TableEngine.editModules.SimpleTextEditor.prototype.startEditing.apply(this, arguments);
  };

  /**
   * Concludes the editing process.
   * @param {boolean} wasAborted - True if editing was cancelled.
   * @param {boolean} controlHeldDown - True if the control key was held during finish.
   * @returns {boolean} Result of the base editor's finish method.
   */
  ChoicePickerEditor.prototype.completeEdit = function (wasAborted, controlHeldDown) {
    // Ensure the grid instance resumes event listening.
    this.instanceRef.resumeListening();
    // Call the base text editor's finishEditing method to finalize.
    return TableEngine.editModules.SimpleTextEditor.prototype.completeEdit.apply(this, arguments);
  };

  // Assign the newly created dropdown editor to the table engine's edit modules.
  TableEngine.editModules.DropdownWidgetEditor = ChoicePickerEditor;
  // Register this editor with a unique identifier for use in cell properties.
  TableEngine.editModules.registerEditorType('dropdown', ChoicePickerEditor);

})(TableEngine);