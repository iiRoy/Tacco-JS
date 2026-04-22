(function(globalScope) {
  class SchemaFormBuilder {
    constructor(config) {
      if (!config) {
        throw new Error("SchemaFormBuilder requires a configuration object, e.g., 'new SchemaFormBuilder({...});'.");
      }
      if (!config.schemaDefinition) {
        throw new Error("SchemaFormBuilder needs a schema definition, e.g., 'new SchemaFormBuilder({schemaDefinition:{...}});'.");
      }
      if (!config.dataInputSelector) {
        throw new Error("SchemaFormBuilder requires a data input selector, e.g., 'new SchemaFormBuilder({dataInputSelector:'#my-data-area'});'.");
      }

      this.configuration = config;
      this.dataInputArea = document.querySelector(config.dataInputSelector);
      if (!this.dataInputArea) {
        throw new Error(`Data input element not found for selector: ${config.dataInputSelector}`);
      }

      this.errorTransformer = config.errorProcessor || (issues => issues);
      this.currentDataState = this.parseInputData(this.dataInputArea.value);
      this.schemaValidatorEngine = globalScope.JSV ? globalScope.JSV.createEnvironment() : null;
      this.tagSplitter = new RegExp(config.tagDelimiter || / *, */);

      if (config.existingFormSelector) {
        this.targetFormElement = document.querySelector(config.existingFormSelector);
        if (!this.targetFormElement) {
          throw new Error(`Existing form element not found for selector: ${config.existingFormSelector}`);
        }
      } else {
        const formContainer = document.querySelector(config.formContainerSelector);
        if (!formContainer) {
          throw new Error(`Form container element not found for selector: ${config.formContainerSelector}`);
        }
        this.targetFormElement = document.createElement('form'); // Use a form element directly
        this.targetFormElement.innerHTML = this.constructFormHtml(this.configuration.schemaDefinition);
        formContainer.appendChild(this.targetFormElement);
      }

      this.populateFormFields(this.currentDataState);
      this.targetFormElement.addEventListener('change', this.handleFormChange.bind(this));
    }

    // Helper to parse JSON from input area
    parseInputData(inputString) {
      try {
        return JSON.parse(inputString || '{}');
      } catch (e) {
        console.warn("Failed to parse initial data from input area, starting with empty object.", e);
        return {};
      }
    }

    // Helper to stringify JSON for input area
    serializeDataState() {
      return JSON.stringify(this.currentDataState, null, 2);
    }

    // Helper to get schema property type
    retrieveSchemaPropertyType(propertyName) {
      const props = this.configuration.schemaDefinition.properties;
      return (props && props[propertyName] && props[propertyName].type) ? props[propertyName].type : undefined;
    }

    // Helper to dispatch custom events
    emitCustomEvent(element, eventName, detail = {}) {
      element.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
    }

    // Generates the form HTML based on the schema
    constructFormHtml(schema) {
      if (!schema || !schema.properties) return '';

      const fieldElements = Object.entries(schema.properties).map(([propName, propConfig]) => {
        let inputHtmlContent = '';
        const fieldLabel = propConfig.description || propName;
        const requiredMark = propConfig.required === true ? '<em>(required)</em>' : (propConfig.required === false ? '<em>(optional)</em>' : '');
        const dataListId = `${propName}-dataoptions`;
        const dataListAttribute = `list="${dataListId}"`;

        if (propConfig.type === 'time' || propConfig.type === 'date') {
          inputHtmlContent = `<input name="${propName}" ${dataListAttribute} type="${propConfig.type}"/>`;
        } else if (propConfig.type === 'date-time') {
          inputHtmlContent = `<input name="${propName}" ${dataListAttribute} type="datetime"/>`;
        } else if (propConfig.type === 'integer' || propConfig.type === 'number') {
          inputHtmlContent = `<input name="${propName}" ${dataListAttribute} type="number"/>`;
        } else if (propConfig.type === 'boolean') {
          inputHtmlContent = `<input name="${propName}" ${dataListAttribute} type="checkbox"/>`;
        } else if (propConfig.type === 'array' && propConfig.items && propConfig.items.enum) {
          const options = propConfig.items.enum.map(optVal => `<option value="${optVal}">${optVal}</option>`).join('');
          inputHtmlContent = `<select multiple name="${propName}">${options}</select>`;
        } else { // 'string' and other types
          if (!propConfig.enum) {
            inputHtmlContent = `<input name="${propName}" ${dataListAttribute} type="text"/>`;
          } else {
            const options = propConfig.enum.map(optVal => `<option value="${optVal}">${optVal}</option>`).join('');
            inputHtmlContent = `<select name="${propName}">${options}</select>`;
          }
        }

        return `<p><label><b>${fieldLabel}</b>${inputHtmlContent}${requiredMark}</label><div class="schema-error-message" data-field-error="${propName}" style="display:none;"></div></p>`;
      }).join('');

      const datalistElements = Object.keys(schema.properties).map(propName => `<datalist id="${propName}-dataoptions"></datalist>`).join('');

      return `<div><h2>${schema.title || 'Dynamic Form'}</h2>${fieldElements}${datalistElements}</div>`;
    }

    // Updates a datalist with new options
    updateOptionList(fieldName, newOptionsHtml) {
      const dataListElement = document.getElementById(`${fieldName}-dataoptions`);
      if (dataListElement) {
        dataListElement.innerHTML = `<select>${newOptionsHtml}</select>`; // Original behavior was to put select inside datalist
      }
    }

    // Displays or clears validation error messages
    displayValidationMessages(issuesList) {
      const processedIssues = this.errorTransformer(issuesList);
      this.targetFormElement.classList.toggle('has-validation-errors', processedIssues.length > 0);

      // Clear all existing error messages
      this.targetFormElement.querySelectorAll('.schema-error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
      });

      if (processedIssues.length === 0) {
        this.emitCustomEvent(this.targetFormElement, 'schemaValidated');
        return;
      }

      this.emitCustomEvent(this.targetFormElement, 'schemaValidationFailed', { issues: processedIssues });

      processedIssues.forEach(issue => {
        const pathSegments = issue.uri.split('/');
        const fieldKey = pathSegments[pathSegments.length - 1];
        let messageContent = issue.message;
        if (issue.details) {
          messageContent += ` (${issue.details})`;
        }

        let errorDisplay = this.targetFormElement.querySelector(`[data-field-error="${fieldKey}"]`);

        if (errorDisplay) {
          errorDisplay.textContent = messageContent;
          errorDisplay.style.display = 'block';
        } else {
          // If a dedicated error display div wasn't found, try to insert one before the input
          const associatedInput = this.targetFormElement.querySelector(`*[name="${fieldKey}"]`);
          if (associatedInput) {
            const newErrorDiv = document.createElement('div');
            newErrorDiv.className = 'schema-error-message';
            newErrorDiv.setAttribute('data-field-error', fieldKey);
            newErrorDiv.textContent = messageContent;
            newErrorDiv.style.display = 'block';
            associatedInput.parentNode.insertBefore(newErrorDiv, associatedInput);
          }
        }
      });
    }

    // Populates form fields from an initial data object
    populateFormFields(initialData) {
      Object.entries(initialData).forEach(([dataKey, dataValue]) => {
        const inputElements = this.targetFormElement.querySelectorAll(`*[name="${dataKey}"]`);
        if (inputElements.length === 0) return;

        const firstInput = inputElements[0];
        const inputType = firstInput.getAttribute("type");
        const schemaFieldType = this.retrieveSchemaPropertyType(dataKey);

        if (inputType === "checkbox" || inputType === "radio") {
          inputElements.forEach(input => {
            let shouldBeChecked;
            if (schemaFieldType === "array") {
              shouldBeChecked = Array.isArray(dataValue) && dataValue.includes(input.value);
            } else {
              shouldBeChecked = dataValue === true;
            }
            input.checked = shouldBeChecked;
          });
        } else {
          firstInput.value = dataValue;
        }
      });
    }

    // Handles form change events, updates internal state, and validates
    handleFormChange(event) {
      const changedElement = event.target;
      const elementTagName = changedElement.tagName.toLowerCase();
      const elementName = changedElement.getAttribute('name');
      let elementValue = changedElement.value;
      const elementCheckedState = changedElement.checked;

      let determinedInputType;
      if (elementTagName === "select") {
        determinedInputType = "select";
        if (changedElement.multiple) { // Handle multi-select
          elementValue = Array.from(changedElement.options)
                              .filter(opt => opt.selected)
                              .map(opt => opt.value);
        }
      } else {
        determinedInputType = changedElement.getAttribute("type") || "text";
      }

      this.updateInternalStateAndRevalidate(determinedInputType, elementName, elementValue, elementCheckedState);
    }

    // Updates the internal data state based on input changes and triggers validation
    updateInternalStateAndRevalidate(inputType, fieldName, fieldValue, isChecked) {
      if (!fieldName || !this.configuration.schemaDefinition.properties || !this.configuration.schemaDefinition.properties[fieldName]) {
        return;
      }

      const fieldSchemaType = this.retrieveSchemaPropertyType(fieldName);

      if (fieldSchemaType === "boolean") {
        this.currentDataState[fieldName] = isChecked;
      } else if (fieldSchemaType === "integer") {
        this.currentDataState[fieldName] = parseInt(fieldValue, 10);
      } else if (fieldSchemaType === "number") {
        this.currentDataState[fieldName] = parseFloat(fieldValue);
      } else if (fieldSchemaType === "array" && inputType === "text") {
        this.currentDataState[fieldName] = fieldValue.split(this.tagSplitter).filter(Boolean); // Filter out empty strings
      } else if (fieldSchemaType === "array" && inputType !== "select") {
        let currentArray = this.currentDataState[fieldName] || [];
        const valueIndex = currentArray.indexOf(fieldValue);
        const valueExists = valueIndex !== -1;

        if (isChecked && !valueExists) {
          currentArray.push(fieldValue);
        } else if (!isChecked && valueExists) {
          currentArray = currentArray.filter((_, i) => i !== valueIndex);
        }
        this.currentDataState[fieldName] = currentArray;
      } else if (fieldSchemaType === "array" && inputType === "select") {
         // Multi-select updates the value directly as an array from handleFormChange
         this.currentDataState[fieldName] = fieldValue;
      } else {
        this.currentDataState[fieldName] = fieldValue;
      }

      if (this.schemaValidatorEngine) {
        const validationReport = this.schemaValidatorEngine.validate(this.currentDataState, this.configuration.schemaDefinition);
        this.displayValidationMessages(validationReport.errors);
      }

      this.dataInputArea.value = this.serializeDataState();
    }

    // Deprecated method equivalent
    setValidationReport(report) {
      this.displayValidationMessages(report.errors);
    }
  }

  // Expose the class globally
  globalScope.SchemaFormBuilder = SchemaFormBuilder;

})(window);