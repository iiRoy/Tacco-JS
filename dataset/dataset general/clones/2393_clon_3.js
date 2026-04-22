(function($ext) {
  /**
   * jQuery plugin entry point for the Workflow Configuration Component.
   * Enables dynamic creation and management of action sequences.
   * @param {object|string} componentConfig - Configuration object or command string.
   * @returns {jQuery|Array} jQuery object for chaining or collected data.
   */
  $ext.fn.workflowComposer = function(componentConfig) {
    // Check if the component is being queried for its current state
    if (typeof componentConfig === "string" && componentConfig === "fetchState") {
      const componentInstance = $ext(this).first().data("workflowComposerInstance");
      if (componentInstance instanceof WorkflowProcessor) {
        return componentInstance.retrieveConfiguration();
      } else {
        console.warn("WorkflowComposer: No active instance found on the first selected element.");
        return []; // Return empty array if no instance
      }
    } else {
      // Initialize the component for each selected element
      return $ext(this).each(function() {
        const currentElement = $ext(this);
        // Prevent re-initialization on the same element
        if (currentElement.data("workflowComposerInstance")) {
          console.info("WorkflowComposer: Component already initialized on this element. Skipping.");
          return;
        }

        try {
          const processor = new WorkflowProcessor(this, componentConfig);
          currentElement.data("workflowComposerInstance", processor);
        } catch (error) {
          console.error("WorkflowComposer: Failed to initialize component.", error);
          // Optionally, add a visual error indicator to the element
          currentElement.html('<div style="color: red;">Error initializing workflow composer.</div>');
        }
      });
    }
  };

  /**
   * Constructor for the WorkflowProcessor component.
   * Manages the lifecycle and rendering of the workflow builder UI.
   * @param {HTMLElement} hostElement - The DOM element to attach the component to.
   * @param {object} initialSettings - Initial configuration for the component.
   */
  function WorkflowProcessor(hostElement, initialSettings) {
    this.targetContainer = $ext(hostElement);
    // Merge provided settings with default values
    this.componentSettings = Object.assign({}, WorkflowProcessor.DEFAULTS, initialSettings);

    // Basic validation for essential settings
    if (!Array.isArray(this.componentSettings.availableSteps)) {
      throw new Error("WorkflowProcessor: 'availableSteps' must be an array in settings.");
    }

    this.initializeComponent();
  }

  // Default settings for the WorkflowProcessor
  WorkflowProcessor.DEFAULTS = {
    availableSteps: [], // List of possible workflow steps
    initialWorkflowData: [], // Pre-existing workflow data
    addStepLabel: "Add New Step",
    removeStepLabel: "Remove This Step",
    stepClassPrefix: "wf-step-",
    fieldClassPrefix: "wf-field-"
  };

  /**
   * Prototype methods for the WorkflowProcessor.
   */
  WorkflowProcessor.prototype = {
    /**
     * Initializes the component by rendering the initial workflow UI.
     */
    initializeComponent: function() {
      // Cache references to frequently used settings
      this.availableSteps = this.componentSettings.availableSteps;
      this.currentWorkflowData = this.componentSettings.initialWorkflowData;

      // Compose the initial UI structure
      const renderedUI = this.composeWorkflowUI(this.currentWorkflowData);
      this.targetContainer.empty().append(renderedUI); // Clear existing content and append new UI
      console.log("WorkflowProcessor: Component initialized and rendered.");
    },

    /**
     * Composes the main workflow UI, including existing steps and controls.
     * @param {Array} workflowItems - Array of workflow step data objects.
     * @returns {jQuery} The jQuery object representing the complete workflow UI.
     */
    composeWorkflowUI: function(workflowItems) {
      const mainContainerDiv = $ext("<div>", {"class": "workflow-container"});
      const controlPanelDiv = $ext("<div>", {"class": "workflow-controls"});
      const addNewStepBtn = $ext("<a>", {
        "href": "#",
        "class": "add-workflow-item",
        "text": this.componentSettings.addStepLabel
      });
      const selfReference = this; // Capture 'this' for event handlers

      // Event handler for adding a new step
      addNewStepBtn.on('click', function(evt) {
        evt.preventDefault();
        mainContainerDiv.append(selfReference.createSingleStepElement({}));
        console.log("WorkflowProcessor: New step added.");
      });

      controlPanelDiv.append(addNewStepBtn);
      mainContainerDiv.append(controlPanelDiv);

      // Render existing workflow items
      if (Array.isArray(workflowItems) && workflowItems.length > 0) {
        workflowItems.forEach(stepData => {
          const stepWrapper = selfReference.createSingleStepElement(stepData);
          mainContainerDiv.append(stepWrapper);

          // Apply saved values to parameters within the step
          // This uses a queue-like approach to handle nested parameters
          const paramQueue = [stepData];
          while (paramQueue.length > 0) {
            const currentField = paramQueue.shift();
            if (currentField && currentField.name) {
              const inputSelector = `:input[name='${currentField.name}']`;
              const targetInput = stepWrapper.find(inputSelector);
              if (targetInput.length) {
                targetInput.val(currentField.value);
                // Trigger change to update dependent fields if any
                if (targetInput.is('select')) {
                  targetInput.trigger('change');
                }
              }
              if (Array.isArray(currentField.params)) {
                paramQueue.push(...currentField.params);
              }
            }
          }
        });
      } else {
        console.log("WorkflowProcessor: No initial workflow data provided.");
        // Optionally add a message or an empty step if data is empty
        // mainContainerDiv.append(selfReference.createSingleStepElement({}));
      }
      return mainContainerDiv;
    },

    /**
     * Creates a single workflow step element, including its type selector and parameter fields.
     * @param {object} stepDefinition - Data defining the step (e.g., name, initial parameters).
     * @returns {jQuery} The jQuery object for the step's UI.
     */
    createSingleStepElement: function(stepDefinition) {
      const matchingStepConfig = this._locateStepDefinition(stepDefinition.name);
      const stepWrapper = $ext("<div>", {"class": `workflow-step ${this.componentSettings.stepClassPrefix}${stepDefinition.name || 'new'}`});
      const parameterContainer = $ext("<div>", {"class": "step-parameters"});
      const stepTypeSelector = $ext("<select>", {"class": "step-type-selector", "name": "step-type"});
      const selfInstance = this;

      // Add a default "Select Type" option
      stepTypeSelector.append($ext("<option>", {"text": "--- Select Step Type ---", "value": ""}));

      // Populate step type selector with available steps
      this.availableSteps.forEach(stepOption => {
        const typeOption = $ext("<option>", {"text": stepOption.label, "value": stepOption.name});
        stepTypeSelector.append(typeOption);
      });

      // Event handler for when the step type is changed
      stepTypeSelector.on('change', function() {
        const selectedType = $ext(this).val();
        const selectedTypeConfig = selfInstance._locateStepDefinition(selectedType);

        parameterContainer.empty(); // Clear existing parameters
        stepWrapper.attr("class", `workflow-step ${selfInstance.componentSettings.stepClassPrefix}${selectedType}`);

        if (selectedTypeConfig && selectedTypeConfig.params) {
          // Iterate over parameters and build their input components
          Object.keys(selectedTypeConfig.params).forEach(paramKey => {
            const paramSpec = selectedTypeConfig.params[paramKey];
            parameterContainer.append(selfInstance.constructInputComponent(paramSpec));
          });
        }
        console.log(`WorkflowProcessor: Step type changed to '${selectedType}'.`);
      });

      const deleteStepBtn = $ext("<a>", {
        "href": "#",
        "class": "remove-workflow-item",
        "text": this.componentSettings.removeStepLabel
      });
      deleteStepBtn.on('click', function(evt) {
        evt.preventDefault();
        stepWrapper.remove(); // Remove the entire step element
        console.log("WorkflowProcessor: Step removed.");
      });

      // Initialize selector with existing data if available
      if (matchingStepConfig) {
        stepTypeSelector.val(matchingStepConfig.name);
        stepTypeSelector.trigger('change'); // Trigger change to render parameters
        // Apply saved parameter values after parameters are rendered
        if (stepDefinition.params) {
          for (const paramKey in stepDefinition.params) {
            // Find the input within the already rendered parameterContainer
            parameterContainer.find(`:input[name='${paramKey}']`).val(stepDefinition.params[paramKey]);
          }
        }
      } else {
        // For new steps or steps with no predefined type, trigger change to show default/empty state
        stepTypeSelector.trigger('change');
      }

      stepWrapper.append(stepTypeSelector, parameterContainer, deleteStepBtn);
      return stepWrapper;
    },

    /**
     * Constructs an input component based on a field specification.
     * Handles different field types (select, text, numeric, textarea).
     * @param {object} fieldSpec - Specification for the field to build.
     * @returns {jQuery} The jQuery object for the input component.
     */
    constructInputComponent: function(fieldSpec) {
      const inputWrapper = $ext("<div>", {"class": `parameter-field ${this.componentSettings.fieldClassPrefix}${fieldSpec.name}`});
      const dependentFieldsContainer = $ext("<div>", {"class": "dependent-parameters"});
      const that = this; // Capture 'this' for nested functions

      // Always add a label for the field
      inputWrapper.append($ext("<label>", {"text": fieldSpec.label + ":"}));

      // Use a switch statement for cleaner handling of field types
      switch (fieldSpec.fieldType) {
        case "select":
          const optionPicker = $ext("<select>", {"name": fieldSpec.name});
          // Add a default "Choose an option" for selects
          optionPicker.append($ext("<option>", {"text": "-- Choose --", "value": ""}));

          if (Array.isArray(fieldSpec.options)) {
            fieldSpec.options.forEach(choiceData => {
              const choiceElement = $ext("<option>", {"text": choiceData.label, "value": choiceData.name});
              choiceElement.data("choiceDetails", choiceData); // Store full option data
              optionPicker.append(choiceElement);
            });
          }

          optionPicker.on('change', function() {
            const selectedOption = $ext(this).find("> :selected");
            const choiceDetails = selectedOption.data("choiceDetails");
            dependentFieldsContainer.empty(); // Clear previous dependent fields

            if (choiceDetails && Array.isArray(choiceDetails.params)) {
              choiceDetails.params.forEach(subFieldSpec => {
                dependentFieldsContainer.append(that.constructInputComponent(subFieldSpec));
              });
            }
          });
          optionPicker.trigger('change'); // Trigger change to render initial dependent fields
          inputWrapper.append(optionPicker);
          break;

        case "text":
          const textInput = $ext("<input>", {"type": "text", "name": fieldSpec.name, "placeholder": fieldSpec.placeholder || ""});
          inputWrapper.append(textInput);
          break;

        case "numeric":
          const numericInput = $ext("<input>", {
            "type": "text", // Use text for better browser compatibility with custom validation
            "name": fieldSpec.name,
            "class": "numeric-input",
            "placeholder": fieldSpec.placeholder || "",
            "pattern": "^[0-9]*\\.?[0-9]+$" // Basic numeric pattern validation
          });
          inputWrapper.append(numericInput);
          break;

        case "textarea":
          const areaId = `textarea-${Math.random().toString(36).substr(2, 9)}`; // Generate unique ID
          const textAreaElement = $ext("<textarea>", {"name": fieldSpec.name, "id": areaId, "rows": fieldSpec.rows || 3, "placeholder": fieldSpec.placeholder || ""});
          inputWrapper.append(textAreaElement);
          break;

        default:
          console.warn(`WorkflowProcessor: Unknown field type encountered: ${fieldSpec.fieldType}`);
          inputWrapper.append($ext("<span>", {"class": "error-msg", "text": "Unsupported field type."}));
          break;
      }

      inputWrapper.append(dependentFieldsContainer); // Append container for dependent fields
      return inputWrapper;
    },

    /**
     * Collects the current configuration data from the UI.
     * @param {jQuery} [elementsToProcess] - Optional: specific elements to collect data from.
     * @returns {Array} An array of collected workflow step data.
     */
    retrieveConfiguration: function(elementsToProcess) {
      const selfRef = this;
      // Default to collecting data from all workflow steps within the target container
      elementsToProcess = elementsToProcess || this.targetContainer.find(".workflow-step");

      const collectedOutput = [];
      if (!elementsToProcess.length) {
        console.info("WorkflowProcessor: No workflow steps found to collect data from.");
        return [];
      }

      elementsToProcess.each(function() {
        const currentStepElement = $ext(this);
        const mainInput = currentStepElement.find("> .step-type-selector");
        const nestedFields = currentStepElement.find("> .step-parameters > .parameter-field");

        const inputValue = mainInput.val();
        if (!inputValue) {
          console.warn("WorkflowProcessor: Skipping unselected step type.");
          return; // Skip steps without a selected type
        }

        let stepRecord = {name: inputValue};

        if (nestedFields.length > 0) {
          stepRecord.params = selfRef.extractParameters(nestedFields);
        }
        collectedOutput.push(stepRecord);
      });
      console.log("WorkflowProcessor: Configuration data collected.", collectedOutput);
      return collectedOutput;
    },

    /**
     * Extracts parameters from a set of field elements.
     * @param {jQuery} paramElements - jQuery collection of parameter field elements.
     * @returns {object} An object mapping parameter names to their values.
     */
    extractParameters: function(paramElements) {
      const extractedMap = {};
      if (!paramElements.length) {
        return extractedMap;
      }

      // Use Array.from and reduce for a functional approach
      Array.from(paramElements).reduce((accumulator, currentElement) => {
        const paramInput = $ext(currentElement).find(':input').first(); // Get the primary input
        if (paramInput.length && paramInput.attr('name')) {
          let paramValue = paramInput.val();
          // Basic type conversion for numeric fields
          if (paramInput.hasClass('numeric-input') && !isNaN(parseFloat(paramValue))) {
            paramValue = Number(paramValue);
          }
          accumulator[paramInput.attr('name')] = paramValue;
        }
        // Recursively collect from dependent fields
        const dependentFields = $ext(currentElement).find('> .dependent-parameters > .parameter-field');
        if (dependentFields.length) {
            Object.assign(accumulator, this.extractParameters(dependentFields));
        }
        return accumulator;
      }, extractedMap);

      return extractedMap;
    },

    /**
     * Locates a step definition object from the availableSteps array by its name.
     * @param {string} identifier - The name of the step to find.
     * @returns {object|undefined} The found step definition or undefined if not found.
     * @private
     */
    _locateStepDefinition: function(identifier) {
      if (!identifier || !Array.isArray(this.availableSteps)) {
        return undefined; // Guard against invalid input
      }
      // Use Array.prototype.find for a more concise search
      return this.availableSteps.find(currentDefinition => currentDefinition.name === identifier);
    }
  };

})(jQuery); // Pass jQuery as $ext to avoid conflicts and for clarity