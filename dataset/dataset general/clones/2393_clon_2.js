(function(jq) {
  /**
   * jQuery plugin entry point for the Task Assembler.
   * Allows initialization or data retrieval for assembled tasks.
   * @param {object|string} config - Configuration object or command string "data".
   * @returns {object|jQuery} - Collected data or jQuery object for chaining.
   */
  jq.fn.taskAssembler = function(config) {
    // If the configuration is a specific string, retrieve current task data.
    if ( config === "data" ) {
      // Find the first instance's assembler and return its collected information.
      var assemblerInstance = jq(this).eq(0).data("taskAssembler");
      return assemblerInstance.gatherTaskDetails();
    }
    else {
      // Initialize the task assembler for each selected element.
      return jq(this).each(function() {
        // Create a new assembler instance for the current DOM element.
        let currentAssembler = new TaskAssembler(this, config);
        // Store the instance in the element's data for later access.
        jq(this).data("taskAssembler", currentAssembler);
      });
    }
  };

  /**
   * Constructor for the TaskAssembler component.
   * Manages the dynamic assembly and modification of task input forms.
   * @param {HTMLElement} domElement - The DOM element to attach the assembler to.
   * @param {object} config - Initial configuration for the assembler.
   */
  function TaskAssembler(domElement, config) {
    // Reference to the host DOM element as a jQuery object.
    this.hostElement = jq(domElement);
    // Component configuration, with defaults if not provided.
    this.configuration = config || {};
    // Perform initial setup.
    this.initialize();
  }

  // Define prototype methods for the TaskAssembler.
  TaskAssembler.prototype = {
    /**
     * Initializes the TaskAssembler instance.
     * Sets up internal data structures and renders initial tasks.
     */
    initialize: function() {
      // Store the available task definitions from the configuration.
      this.availableTasks = this.configuration.tasks;
      // Initialize task data, potentially from configuration.
      this.itemData = this.configuration.initialData || [];
      // Build the initial set of task controls based on provided data.
      const constructedTasks = this.constructTasks(this.itemData);
      // Populate the host element with the generated task controls.
      this.hostElement.html(constructedTasks);
    },

    /**
     * Constructs the main container for all tasks and their controls.
     * @param {Array<object>} itemDetails - Array of task specifications to pre-populate.
     * @returns {jQuery} - The jQuery object representing the task container.
     */
    constructTasks: function(itemDetails) {
      // Main wrapper for all task items.
      const taskWrapper = jq("<div>", { "class": "task-list-wrapper" });
      // Container for global action buttons (like "Add Task").
      const controlButtons = jq("<div>", { "class": "action-controls" });
      // Button to add a new task entry.
      const addNewTaskBtn = jq("<a>", { "href": "#", "class": "add-entry", "text": "Append Task" });
      // Capture 'this' for use within event handlers.
      const instanceRef = this;

      // Attach click handler to the "Add Task" button.
      addNewTaskBtn.on('click', function(eventObj) {
        eventObj.preventDefault(); // Prevent default link behavior.
        // Append a new, empty task entry to the wrapper.
        taskWrapper.append(instanceRef.constructTask({}));
      });

      // Assemble the control buttons.
      controlButtons.append(addNewTaskBtn);
      taskWrapper.append(controlButtons); // Add controls to the main wrapper.

      // Iterate through initial item details to build pre-existing tasks.
      for ( let idx = 0; idx < itemDetails.length; idx++ ) {
        const currentTaskSpec = itemDetails[idx];
        const taskDisplayDiv = this.constructTask(currentTaskSpec); // Create task UI.

        // Populate fields within the newly created task UI.
        let inputParameters = [currentTaskSpec]; // Start with the main task spec.
        let currentField;
        // Process parameters recursively.
        while ( (currentField = inputParameters.shift()) ) {
          // Find the input element by name and set its value, then trigger change.
          taskDisplayDiv.find(`:input[name='${currentField.name}']`).val(currentField.value).trigger('change');
          // If there are nested parameters, add them to the queue for processing.
          if ( currentField.params ) {
            inputParameters = inputParameters.concat(currentField.params);
          }
        }
        // Add the fully constructed and populated task UI to the wrapper.
        taskWrapper.append(taskDisplayDiv);
      }
      return taskWrapper; // Return the complete task list container.
    },

    /**
     * Constructs a single task entry UI element.
     * @param {object} itemDetails - Data for the specific task to build.
     * @returns {jQuery} - The jQuery object for the task entry.
     */
    constructTask: function(itemDetails) {
      // Find the task definition based on its name.
      const taskDefinition = this._locateTaskDefinition(itemDetails.name);
      // Main container for this individual task.
      const taskContainerDiv = jq("<div>", { "class": "single-task-entry" });
      // Container for sub-fields related to the selected task type.
      const subInputArea = jq("<div>", { "class": "sub-input-fields" });
      // Dropdown for selecting the task type.
      const taskSelector = jq("<select>", { "class": "task-type-selector", "name": "task-selector-field" });

      // Populate the task type selector with available tasks.
      for ( let idx = 0; idx < this.availableTasks.length; idx++ ) {
        const potentialTask = this.availableTasks[idx];
        const selectOption = jq("<option>", { "text": potentialTask.label, "value": potentialTask.name });
        taskSelector.append(selectOption);
      }

      const instanceRef = this; // Cache 'this' for event handler.
      // Attach change event to the task selector.
      taskSelector.on('change', function() {
        const selectedValue = jq(this).val();
        const selectedTaskSpec = instanceRef._locateTaskDefinition(selectedValue);
        subInputArea.empty(); // Clear existing sub-fields.

        // If the selected task type has parameters, build them.
        if ( selectedTaskSpec.params ) {
          for ( const paramKey in selectedTaskSpec.params ) {
            // Append each parameter's input field.
            subInputArea.append(instanceRef.constructInput(selectedTaskSpec.params[paramKey]));
          }
        }

        // Update the main task container's class based on the selected task type.
        taskContainerDiv.attr("class", "single-task-entry " + selectedValue);
      });

      // Link to remove this task entry.
      const deleteTaskLink = jq("<a>", { "href": "#", "class": "remove-entry", "text": "Delete Task" });
      // Attach click handler to the remove link.
      deleteTaskLink.on('click', function(eventObj) {
        eventObj.preventDefault(); // Stop default link action.
        taskContainerDiv.remove(); // Remove the entire task entry from the DOM.
      });

      // If initial item details are provided, set the selector value and trigger change.
      if ( taskDefinition ) {
        taskSelector.val(taskDefinition.name);
        taskSelector.trigger('change'); // Trigger change to build initial sub-fields.
        // If there are specific parameter values for this task, populate them.
        if ( itemDetails.params ) {
          for ( const paramKey in itemDetails.params ) {
            // Find the sub-field input by name and set its value.
            subInputArea.find(`:input[name='${paramKey}']`).val(itemDetails.params[paramKey]);
          }
        }
      }
      else {
        // If no definition, just trigger change to display default sub-fields (if any).
        taskSelector.trigger('change');
      }
      
      // Append all constructed parts to the main task container.
      taskContainerDiv.append(taskSelector);
      taskContainerDiv.append(subInputArea);
      taskContainerDiv.append(deleteTaskLink);
      return taskContainerDiv; // Return the complete task entry UI.
    },

    /**
     * Constructs a single input field based on its definition.
     * @param {object} fieldDefinition - Object defining the input field.
     * @returns {jQuery} - The jQuery object for the input field container.
     */
    constructInput: function(fieldDefinition) {
      // Main wrapper for a single input field.
      const fieldContainerDiv = jq("<div>", { "class": "input-field-wrapper" });
      // Container for nested sub-fields (e.g., for conditional inputs).
      const nestedFields = jq("<div>", { "class": "nested-inputs" });
      const instanceRef = this; // Cache 'this'.

      // Create and append the label for the input field.
      const inputLabel = jq("<label>", { "text": fieldDefinition.label });
      fieldContainerDiv.append(inputLabel);

      // Branch based on the field type.
      if ( fieldDefinition.inputType === "dropdown" ) {
        // Label for the dropdown (can be redundant if fieldContainerDiv already has one, but maintaining structure).
        const dropdownLabel = jq("<label>", { "text": fieldDefinition.label });
        const dropdownSelect = jq("<select>", { "name": fieldDefinition.name });

        // Populate dropdown options.
        for ( let idx = 0; idx < fieldDefinition.options.length; idx++ ) {
          const choiceInfo = fieldDefinition.options[idx];
          const selectOption = jq("<option>", { "text": choiceInfo.label, "value": choiceInfo.name });
          selectOption.data("choiceDetails", choiceInfo); // Store original data.
          dropdownSelect.append(selectOption);
        }

        // Handle changes in dropdown selection.
        dropdownSelect.on('change', function() {
          const selectedOption = jq(this).find("> :selected");
          const choiceDetails = selectedOption.data("choiceDetails");
          nestedFields.empty(); // Clear existing nested fields.
          // If the selected option has parameters, build them.
          if ( choiceDetails.params ) {
            for ( let idx = 0; idx < choiceDetails.params.length; idx++ ) {
              const subInputSpec = choiceDetails.params[idx];
              nestedFields.append(instanceRef.constructInput(subInputSpec));
            }
          }
        });

        // Trigger change initially to render any default nested fields.
        dropdownSelect.trigger('change');
        fieldContainerDiv.append(dropdownSelect);
      } else if ( fieldDefinition.inputType === "text_input" ) {
        const dataInputEl = jq("<input>", { "type": "text", "name": fieldDefinition.name });
        fieldContainerDiv.append(dataInputEl);
      } else if ( fieldDefinition.inputType === "number_input" ) {
        const dataInputEl = jq("<input>", { "type": "text", "name": fieldDefinition.name, "class": "numeric-field" });
        fieldContainerDiv.append(dataInputEl);
      } else if ( fieldDefinition.inputType === "long_text" ) {
        const uniqueId = "longtext-" + Math.floor(Math.random() * 99999); // Generate a unique ID.
        const textAreaEl = jq("<textarea>", { "name": fieldDefinition.name, "id": uniqueId });
        fieldContainerDiv.append(textAreaEl);
      }

      // Append the container for nested fields.
      fieldContainerDiv.append(nestedFields);
      return fieldContainerDiv; // Return the complete field UI.
    },

    /**
     * Gathers all data from the assembled task forms.
     * @param {jQuery} [elementsToCollect] - Optional: specific task elements to collect data from.
     * @returns {Array<object>} - An array of objects, each representing a collected task.
     */
    gatherTaskDetails: function(elementsToCollect) {
      const instanceRef = this; // Reference to the current instance.
      // Determine which task elements to process.
      elementsToCollect = elementsToCollect || this.hostElement.find(".single-task-entry");
      const resultArray = []; // Array to store the collected task data.

      // Iterate over each task entry found.
      elementsToCollect.each(function() {
        const currentTaskEl = jq(this);
        const taskTypeInput = currentTaskEl.find("> :input"); // Find the primary input (e.g., select).
        const nestedFields = currentTaskEl.find("> .sub-input-fields > .input-field-wrapper"); // Get sub-fields.
        let inputValue = taskTypeInput.val(); // Get the primary task value.

        // Convert numeric values if the input has the specific class.
        if ( taskTypeInput.hasClass('numeric-field') ) {
          inputValue = Number(inputValue);
        }
        
        // Create an object to represent the collected task.
        const taskEntry = { taskName: inputValue };

        // If there are nested fields, collect their parameters.
        if ( nestedFields.length > 0 ) {
          taskEntry.parameters = instanceRef.gatherInputValues(nestedFields);
        }
        resultArray.push(taskEntry); // Add the collected task to the result.
      });
      return resultArray; // Return the array of collected task data.
    },

    /**
     * Gathers values from a set of input fields.
     * @param {jQuery} fieldsToCollect - A jQuery object containing input field wrappers.
     * @returns {object} - An object where keys are input names and values are their collected values.
     */
    gatherInputValues: function(fieldsToCollect) {
      const collectedValues = {}; // Object to store collected parameter values.
      // Iterate over each field wrapper.
      fieldsToCollect.each(function() {
        const currentFieldEl = jq(this);
        const dataInputEl = currentFieldEl.find(':input'); // Find the actual input element.
        collectedValues[dataInputEl.attr('name')] = dataInputEl.val(); // Store name-value pair.
      });
      return collectedValues; // Return the collected parameter values.
    },

    /**
     * Internal helper to find a task definition by its name.
     * @param {string} taskNameId - The name/ID of the task to find.
     * @returns {object|undefined} - The task definition object or undefined if not found.
     */
    _locateTaskDefinition: function(taskNameId) {
      // Iterate through all available task definitions.
      for ( let idx = 0; idx < this.availableTasks.length; idx++ ) {
        const taskDefinition = this.availableTasks[idx];
        // If a match is found, return the definition.
        if ( taskDefinition.name === taskNameId ) {
          return taskDefinition;
        }
      }
      // If no task definition is found, return nothing.
      return undefined;
    }
  }; // End of TaskAssembler.prototype

})(jQuery);