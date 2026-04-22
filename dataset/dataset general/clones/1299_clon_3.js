/*
 * This module defines a dynamic form rendering component using React's old createClass syntax.
 * It supports various input types, including text fields and dropdowns, with dynamic state management.
 * The form's structure and initial values are passed via props, allowing for flexible form generation.
 * This component handles value changes internally and can optionally notify a parent component.
 */
const InteractiveDataEntry = React.createClass({
    displayName: 'InteractiveDataEntry', // Added display name for debugging

    // Establishes the initial internal state for the component instance.
    getInitialApplicationState: function() {
        // Initializes the container for all field values managed by this form.
        // `currentFieldValues` will store the latest user-entered data.
        return { currentFieldValues: {} };
    },

    // A sub-component responsible for rendering a standard text input field.
    TextInputControl: React.createClass({
        displayName: 'TextInputControl',

        // Sets up the initial value for this specific input field.
        getInitialState: function() {
            const { fieldDefinition } = this.props;
            // Ensures a default empty string if the initial value is undefined or null.
            const initialDisplayValue = (fieldDefinition && fieldDefinition.value !== undefined && fieldDefinition.value !== null)
                                      ? String(fieldDefinition.value)
                                      : '';
            return { controlledValue: initialDisplayValue };
        },

        // Handles changes to the input field's value. This method is bound automatically in createClass.
        onInputContentChange: function(domEvent) {
            const { fieldDefinition, onValueChangeCallback } = this.props;
            const updatedValue = domEvent.target.value;
            const fieldKey = fieldDefinition.name;

            // Update local state for controlled component behavior.
            this.setState({ controlledValue: updatedValue });

            // Propagate the change up to the parent form, if a callback is provided.
            if (typeof onValueChangeCallback === 'function') {
                onValueChangeCallback(fieldKey, updatedValue);
            } else {
                // Log a warning if the callback is missing, indicating a potential integration issue.
                console.warn(`[TextInputControl] No 'onValueChangeCallback' provided for field: ${fieldKey}. Change not propagated.`);
            }
        },

        // Renders the text input field within its structural elements.
        render: function() {
            const { fieldDefinition, columnConfiguration } = this.props;
            const { controlledValue } = this.state;

            // --- Guard Clauses and Input Validation ---
            if (!fieldDefinition || !fieldDefinition.name) {
                console.error("[TextInputControl] Missing 'fieldDefinition' or 'fieldDefinition.name'. Cannot render this text input.");
                return null; // Render nothing if essential props are missing.
            }
            // Provide a fallback for column configuration if it's invalid.
            const effectiveColumnConfig = Array.isArray(columnConfiguration) && columnConfiguration.length >= 2
                                        ? columnConfiguration
                                        : [4, 8]; // Default Bootstrap column sizes for label and input.

            const labelColumnClass = `control-label col-sm-${effectiveColumnConfig[0]}`;
            const inputColumnClass = `col-sm-${effectiveColumnConfig[1]}`;
            const fieldId = `text-input-${fieldDefinition.name}`; // Unique ID for accessibility.

            return React.DOM.div({
                key: `text-input-group-${fieldDefinition.name}`, // Unique key for list rendering.
                className: "form-group dynamic-text-input-wrapper", // Modified BEM-like class name.
                children: [
                    React.DOM.label({
                        key: `label-for-${fieldDefinition.name}`,
                        className: labelColumnClass,
                        htmlFor: fieldId, // Link label to input for accessibility.
                        children: [
                            fieldDefinition.label || fieldDefinition.name // Fallback to name if label is missing.
                        ]
                    }),
                    React.DOM.div({
                        key: `input-container-for-${fieldDefinition.name}`,
                        className: inputColumnClass,
                        children: [
                            React.DOM.input({
                                key: `field-control-${fieldDefinition.name}`,
                                type: "text",
                                id: fieldId, // Assign unique ID.
                                name: fieldDefinition.name,
                                className: "form-control dynamic-text-field", // Modified class name.
                                value: controlledValue,
                                onChange: this.onInputContentChange // Use the extracted handler.
                            })
                        ]
                    })
                ]
            });
        }
    }),

    // A sub-component dedicated to rendering a dropdown (select) field.
    DropdownFieldControl: React.createClass({
        displayName: 'DropdownFieldControl',

        // Sets the initial selected value for the dropdown.
        getInitialState: function() {
            const { fieldDefinition } = this.props;
            const initialSelection = (fieldDefinition && fieldDefinition.value !== undefined && fieldDefinition.value !== null)
                                   ? fieldDefinition.value
                                   : ''; // Default to empty string if no value.
            return { selectedOptionValue: initialSelection };
        },

        // Updates the component's state when new props are received, typically when the parent re-renders.
        componentWillReceiveProps: function(nextPropsBundle) {
            // Guard against null/undefined props and ensure `fieldDefinition` exists.
            if (!nextPropsBundle || !nextPropsBundle.fieldDefinition || !this.props.fieldDefinition) {
                return;
            }

            // Only update if the item's value has actually changed to prevent unnecessary re-renders.
            if (nextPropsBundle.fieldDefinition.value !== this.props.fieldDefinition.value) {
                this.setState({ selectedOptionValue: nextPropsBundle.fieldDefinition.value });
            }
        },

        // Handles selection changes in the dropdown.
        onDropdownSelectionChange: function(domEvent) {
            const { fieldDefinition, onValueChangeCallback } = this.props;
            const newlySelectedValue = domEvent.target.value;
            const fieldKey = fieldDefinition.name;

            this.setState({ selectedOptionValue: newlySelectedValue });

            if (typeof onValueChangeCallback === 'function') {
                onValueChangeCallback(fieldKey, newlySelectedValue);
            } else {
                console.warn(`[DropdownFieldControl] No 'onValueChangeCallback' provided for field: ${fieldKey}. Change not propagated.`);
            }
        },

        // Renders the select input field and its options.
        render: function() {
            const { fieldDefinition, columnConfiguration } = this.props;
            const { selectedOptionValue } = this.state;

            // --- Guard Clauses and Input Validation ---
            if (!fieldDefinition || !fieldDefinition.name || !Array.isArray(fieldDefinition.options)) {
                console.error("[DropdownFieldControl] Missing essential 'fieldDefinition' properties (name, options). Cannot render this dropdown.");
                return null;
            }
            const effectiveColumnConfig = Array.isArray(columnConfiguration) && columnConfiguration.length >= 2
                                        ? columnConfiguration
                                        : [4, 8]; // Default column sizes.

            const labelColClass = `control-label col-sm-${effectiveColumnConfig[0]}`;
            const selectColClass = `col-sm-${effectiveColumnConfig[1]}`;
            const fieldId = `select-input-${fieldDefinition.name}`; // Unique ID for accessibility.

            // Map options to React elements, ensuring each has a unique key and proper handling of values/labels.
            const optionElements = fieldDefinition.options.map((choiceItem, index) => {
                // Ensure value is a string or number, and label has a fallback.
                const choiceValue = (choiceItem.value !== undefined && choiceItem.value !== null) ? choiceItem.value : '';
                const choiceLabel = (choiceItem.label !== undefined && choiceItem.label !== null) ? choiceItem.label : choiceValue;

                return React.DOM.option({
                    key: `option-${fieldDefinition.name}-${choiceValue}-${index}`, // Robust key for option elements.
                    disabled: Boolean(choiceItem.disabled), // Explicit boolean conversion for disabled prop.
                    value: choiceValue,
                    children: [
                        String(choiceLabel) // Ensure child is a string for React rendering.
                    ]
                });
            });

            return React.DOM.div({
                key: `select-group-${fieldDefinition.name}`,
                className: "form-group dynamic-dropdown-wrapper", // Modified class name.
                children: [
                    React.DOM.label({
                        key: `label-for-${fieldDefinition.name}`,
                        className: labelColClass,
                        htmlFor: fieldId,
                        children: [
                            fieldDefinition.label || fieldDefinition.name // Fallback to name.
                        ]
                    }),
                    React.DOM.div({
                        key: `select-container-for-${fieldDefinition.name}`,
                        className: selectColClass,
                        children: [
                            React.DOM.select({
                                key: `field-control-${fieldDefinition.name}`,
                                id: fieldId,
                                className: "form-control dynamic-select-field", // Modified class name.
                                name: fieldDefinition.name,
                                value: selectedOptionValue,
                                onChange: this.onDropdownSelectionChange, // Use the extracted handler.
                                children: optionElements // Render all generated option elements.
                            })
                        ]
                    })
                ]
            });
        }
    }),

    // Computes and returns the complete set of current form values, prioritizing state then props.
    deriveCurrentFormState: function() {
        const { inputSchema } = this.props;
        const { currentFieldValues } = this.state;
        const computedFieldState = {};

        if (!Array.isArray(inputSchema)) {
            console.error("[deriveCurrentFormState] 'inputSchema' prop is not an array. Returning empty state.");
            return {};
        }

        // Iterate through each field definition to determine its current value.
        inputSchema.forEach(fieldItem => {
            if (!fieldItem || !fieldItem.name) {
                console.warn("[deriveCurrentFormState] Skipping malformed field item due to missing name:", fieldItem);
                return; // Skip processing this malformed item.
            }

            const fieldName = fieldItem.name;

            // Priority:
            // 1. Value from component state (user input).
            // 2. Explicit `value` property from the field definition in props.
            // 3. For select fields, the value of the first option.
            // 4. Default empty string.
            if (currentFieldValues.hasOwnProperty(fieldName)) {
                computedFieldState[fieldName] = currentFieldValues[fieldName];
            } else if (fieldItem.value !== undefined && fieldItem.value !== null) {
                computedFieldState[fieldName] = fieldItem.value;
            } else if (fieldItem.type === "select" && Array.isArray(fieldItem.options) && fieldItem.options.length > 0) {
                computedFieldState[fieldName] = fieldItem.options[0].value;
            } else {
                // Default value for fields without a specific initial state.
                computedFieldState[fieldName] = '';
            }
        });
        return computedFieldState;
    },

    // Callback invoked when a child input component reports a value change.
    handleFieldUpdate: function(fieldIdentifier, updatedValue) {
        // Create a new object for state update to ensure immutability.
        const newFieldValues = {
            ...this.state.currentFieldValues,
            [fieldIdentifier]: (updatedValue === null || updatedValue === undefined) ? '' : updatedValue // Ensure no null/undefined.
        };
        this.setState({ currentFieldValues: newFieldValues });

        // Optional: Call an external `onFormChange` handler if provided via props,
        // allowing the parent component to react to form data changes.
        if (typeof this.props.onFormChange === 'function') {
            this.props.onFormChange(newFieldValues);
        }
    },

    // Determines if a given option should be disabled based on form dependencies.
    // An option is disabled if any of its dependencies are not met by the current form data.
    determineOptionEligibility: function(optionMetadata, currentFormData) {
        // If no dependencies are defined, the option is considered eligible (not disabled by this logic).
        if (!optionMetadata || !optionMetadata.dependencies || Object.keys(optionMetadata.dependencies).length === 0) {
            return false;
        }

        // Iterate through each dependency defined for the option.
        for (const dependencyKey in optionMetadata.dependencies) {
            // Ensure we are only iterating over own properties.
            if (Object.prototype.hasOwnProperty.call(optionMetadata.dependencies, dependencyKey)) {
                const requiredValues = optionMetadata.dependencies[dependencyKey];
                const actualValue = currentFormData[dependencyKey];

                // If the dependency key is not present in the current form data, or
                // if the actual value is not among the required values for this dependency,
                // then the option should be disabled.
                if (!currentFormData.hasOwnProperty(dependencyKey) ||
                    !Array.isArray(requiredValues) ||
                    !requiredValues.includes(actualValue)) {
                    return true; // Disable this option.
                }
            }
        }
        return false; // All dependencies are met, so the option is eligible.
    },

    // Selects the appropriate option value for a dropdown, falling back to the first available
    // if the currently selected value is no longer valid (e.g., due to dynamic disabling).
    selectAppropriateOptionValue: function(activeValue, potentialChoices) {
        if (!Array.isArray(potentialChoices) || potentialChoices.length === 0) {
            return undefined; // No choices available, return undefined.
        }

        // Filter for eligible (not disabled) option values.
        const eligibleValues = potentialChoices
            .filter(choice => !choice.disabled)
            .map(choice => choice.value);

        // If the current `activeValue` is among the `eligibleValues`, it remains selected.
        if (eligibleValues.includes(activeValue)) {
            return activeValue;
        } else {
            // Otherwise, return the first eligible value, or `undefined` if no options are eligible.
            return eligibleValues.length > 0 ? eligibleValues[0] : undefined;
        }
    },

    // Prepares data for a select field, applying dynamic disabled states to its options
    // and determining the correct selected value based on dependencies.
    prepareSelectFieldData: function(rawFieldItem, currentFormSnapshot) {
        // --- Guard Clauses ---
        if (!rawFieldItem || !Array.isArray(rawFieldItem.options)) {
            console.error("[prepareSelectFieldData] Invalid 'rawFieldItem' or missing 'options' array. Returning safe defaults.");
            // Return a safe structure to prevent errors downstream.
            return { ...rawFieldItem, options: [], value: undefined };
        }

        // Map over the raw options to create processed options with dynamic disabled states.
        const processedOptions = rawFieldItem.options.map(rawOption => ({
            value: rawOption.value,
            label: rawOption.label || rawOption.value, // Use value as fallback label.
            // Determine if this specific option should be disabled based on form-wide dependencies.
            disabled: this.determineOptionEligibility(rawOption, currentFormSnapshot)
        }));

        // Determine the final selected value for the select box after options have been processed.
        const finalSelectedValue = this.selectAppropriateOptionValue(
            currentFormSnapshot[rawFieldItem.name], // Current value for this field from the snapshot.
            processedOptions
        );

        // Return a new object with updated options and the final selected value.
        // This ensures immutability of the original `rawFieldItem`.
        return {
            ...rawFieldItem, // Spread original properties to keep others.
            options: processedOptions,
            value: finalSelectedValue
        };
    },

    // Main render method for the entire form.
    render: function() {
        const { formSchemaDefinitions, columnDimensions } = this.props;
        // Derive the current state of all form fields.
        const formStateSnapshot = this.deriveCurrentFormState();

        // --- Top-level Form Validation ---
        if (!Array.isArray(formSchemaDefinitions) || formSchemaDefinitions.length === 0) {
            // Render a warning message if no form structure is provided.
            return React.DOM.div({
                className: "alert alert-warning dynamic-form-empty-message",
                children: ["No form schema definitions provided. Cannot render form."]
            });
        }

        // Helper function to render a single form element based on its type.
        // This makes the main render logic cleaner and more modular.
        const renderFormElement = (schemaItem, index) => {
            if (!schemaItem || !schemaItem.type) {
                console.warn(`[InteractiveDataEntry] Skipping malformed schema item at index ${index} due to missing type:`, schemaItem);
                return null; // Don't render malformed items.
            }

            // Common props to pass to all child form controls.
            const commonPropsForControls = {
                key: `form-item-${schemaItem.name || schemaItem.type}-${index}`, // Robust key for React lists.
                columnConfiguration: columnDimensions || [4, 8], // Ensure columnDimensions exist with a fallback.
                onValueChangeCallback: this.handleFieldUpdate // Pass the parent's update handler.
            };

            // Use a switch statement for clear, extensible handling of different field types.
            switch (schemaItem.type) {
                case "select":
                    // For select fields, pre-process data to handle dynamic option states.
                    const processedSelectField = this.prepareSelectFieldData(schemaItem, formStateSnapshot);
                    return this.DropdownFieldControl({
                        ...commonPropsForControls,
                        fieldDefinition: processedSelectField
                    });
                case "input":
                    // Input fields can use the schema item directly.
                    return this.TextInputControl({
                        ...commonPropsForControls,
                        fieldDefinition: schemaItem
                    });
                case "hidden":
                    // Render a simple hidden input field, useful for passing non-visible data.
                    return React.DOM.input({
                        key: `hidden-input-${schemaItem.name}-${index}`,
                        type: "hidden",
                        name: schemaItem.name,
                        // Prioritize explicit value, then state, then empty string.
                        value: schemaItem.value || formStateSnapshot[schemaItem.name] || ''
                    });
                default:
                    console.warn(`[InteractiveDataEntry] Unknown field type encountered: '${schemaItem.type}' for item '${schemaItem.name}'. Skipping.`);
                    return null; // Don't render unknown types to avoid errors.
            }
        };

        // Render all form elements by mapping over the schema definitions.
        const renderedElements = formSchemaDefinitions.map(renderFormElement);

        return React.DOM.form({
            className: "form-horizontal dynamic-data-entry-form", // Modified class name for the main form.
            onSubmit: (e) => e.preventDefault(), // Prevent default browser form submission behavior.
            children: renderedElements // Render all generated child elements.
        });
    }
});