/*

Proprietary Software Notice

(c) 2023 Acme Corp. All Rights Reserved.

This software and associated documentation files (the "Software") are the
proprietary and confidential property of Acme Corp. and its licensors.
Use, reproduction, distribution, and modification of the Software are
strictly prohibited without the express written permission of Acme Corp.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

*/

(function (moduleInitializationCallback) {
    // Check for AMD/RequireJS environment
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous module for AMD loaders.
        define("SchemaFormRenderer", ['jquery'], moduleInitializationCallback);
    } else {
        // Assume script tags are used, attach to global window object.
        // The global jQuery object is expected to be available.
        window.SchemaFormRenderer = moduleInitializationCallback(jQuery);
    }
}(function(jq) { // Using 'jq' for jQuery to avoid conflicts and signify local scope

    /**
     * @class SchemaFormRenderer
     * @description A utility for dynamically generating and managing HTML forms
     *              based on a JSON schema, with real-time data synchronization
     *              and basic validation feedback.
     * @param {object} componentConfig - Configuration object for the form builder.
     * @param {object} componentConfig.schema - The JSON schema defining the form structure.
     * @param {string} componentConfig.targetElement - CSS selector for the output textarea/input element to sync JSON data.
     * @param {string} [componentConfig.formContainer] - CSS selector for the HTML element where the form should be rendered.
     * @param {string} [componentConfig.existingFormSelector] - CSS selector for an existing form to attach to, instead of rendering a new one.
     * @param {function} [componentConfig.errorDisplayTransformer] - Custom function to format validation errors before display.
     * @param {string} [componentConfig.customFormTemplate] - A custom jQuery.tmpl template string for form rendering.
     * @param {string} [componentConfig.arraySplitDelimiter] - Regular expression string for splitting array input values (default: / *, */).
     */
    function SchemaFormRenderer(componentConfig) {

        // --- Input Validation and Setup ---
        if (!componentConfig) {
            throw new Error("SchemaFormRenderer requires a configuration object. Example: `new SchemaFormRenderer({...});`.");
        }

        if (!componentConfig.schema) {
            throw new Error("SchemaFormRenderer: A `schema` property is mandatory in the configuration.");
        }

        if (!componentConfig.targetElement) {
            throw new Error("SchemaFormRenderer: A `targetElement` (e.g., '#jsonOutput') for the JSON input/textarea is required.");
        }

        const instanceContext = this; // Retain 'this' for internal methods
        const jsonOutputArea = jq(componentConfig.targetElement);

        // Ensure the target element exists
        if (jsonOutputArea.length === 0) {
            throw new Error(`SchemaFormRenderer: Target element '${componentConfig.targetElement}' not found.`);
        }

        // Default error formatter, can be overridden
        const errorDisplayTransformer = componentConfig.errorDisplayTransformer || function(issues) {
            return issues;
        };

        // Attempt to parse initial JSON data from the target element
        let currentSchemaPayload = {};
        try {
            const initialValue = jsonOutputArea.val();
            if (initialValue) {
                currentSchemaPayload = jq.parseJSON(initialValue);
            }
        } catch (parseError) {
            console.warn("SchemaFormRenderer: Initial JSON parsing failed. Starting with an empty object. Error:", parseError);
            // Optionally, clear the textarea or display an error to the user
            jsonOutputArea.val("{}");
        }

        let dataValidator = null;
        // Check for JSV (JSON Schema Validator) library availability
        if (window.JSV && typeof window.JSV.createEnvironment === 'function') {
            dataValidator = window.JSV.createEnvironment();
        } else {
            console.info("SchemaFormRenderer: JSV validator not found. Client-side schema validation will be disabled.");
        }

        // Define the regex for splitting array inputs. Default: comma and optional spaces.
        const arrayInputSplitter = new RegExp(componentConfig.arraySplitDelimiter || / *, */);

        let activeFormElement; // The jQuery object representing the form

        /**
         * Generates the HTML markup for the form based on the provided schema.
         * @returns {jQuery} A jQuery object containing the rendered form elements.
         */
        instanceContext.generateMarkup = function() {
            // Use custom template if provided, otherwise fallback to the default prototype template.
            const templateSource = componentConfig.customFormTemplate || instanceContext.DEFAULT_MARKUP_TEMPLATE;
            // Assuming jQuery.tmpl is available for this.
            return jq(templateSource).tmpl(componentConfig.schema);
        };

        // --- Form Rendering and Attachment ---
        if (!componentConfig.existingFormSelector) {
            // No existing form specified, render a new one.
            const renderedFormView = instanceContext.generateMarkup();
            if (!componentConfig.formContainer) {
                console.warn("SchemaFormRenderer: No `formContainer` specified. Appending generated form to body. Consider providing a specific container.");
            }
            const targetContainer = componentConfig.formContainer ? jq(componentConfig.formContainer) : jq('body');
            renderedFormView.appendTo(targetContainer);
            activeFormElement = renderedFormView;
        } else {
            // Attach to an existing form element.
            activeFormElement = jq(componentConfig.existingFormSelector);
            if (activeFormElement.length === 0) {
                throw new Error(`SchemaFormRenderer: Existing form element '${componentConfig.existingFormSelector}' not found.`);
            }
            // If attaching to an existing form, ensure its elements are initialized from the schema payload
            // This will be handled by the initial `syncFormToData` call later.
        }

        /**
         * Updates a specific field's datalist (e.g., for <input list="..."> elements).
         * @param {string} fieldIdentifier - The name/ID of the field.
         * @param {string} optionsHtml - HTML string containing <option> elements (e.g., "<option>A</option><option>B</option>").
         */
        instanceContext.updateFieldOptions = function(fieldIdentifier, optionsHtml) {
            // Find the datalist element by convention (fieldIdentifier_datalist)
            const datalistContainer = jq(`#${fieldIdentifier}_datalist`, activeFormElement);
            if (datalistContainer.length === 0) {
                console.warn(`SchemaFormRenderer: Datalist container for '${fieldIdentifier}' not found.`);
                return;
            }
            // Clear existing options and append new ones within a select tag for compatibility/structure
            // Using a <select> within <datalist> is a common pattern for older browsers/polyfills
            datalistContainer.empty().append(`<select>${optionsHtml}</select>`);
        };

        /**
         * Displays validation errors on the form.
         * @param {Array<object>} validationIssues - An array of validation error objects.
         */
        instanceContext.displayValidationFeedback = function(validationIssues) {
            // Transform errors using the provided formatter
            const processedIssues = errorDisplayTransformer(validationIssues);

            // Toggle a general error class on the form based on error count
            activeFormElement.toggleClass("has-validation-errors", processedIssues.length > 0);

            // Clear all previous error messages before displaying new ones
            jq('.field-validation-error', activeFormElement).hide().html('');

            if (processedIssues.length === 0) {
                // No errors, trigger a 'validated' event and exit
                activeFormElement.trigger('validated.schemaform');
                return;
            }

            // There were errors, show them!
            activeFormElement.trigger('validation-failed.schemaform', processedIssues);

            jq.each(processedIssues, function(idx, reportEntry) {
                // Extract property name from URI (e.g., "/properties/fieldName")
                const fieldNameSegments = reportEntry.uri ? reportEntry.uri.split('/') : [];
                const targetFieldName = fieldNameSegments.length > 0 ? fieldNameSegments[fieldNameSegments.length - 1] : null;

                if (!targetFieldName) {
                    console.warn("SchemaFormRenderer: Could not determine field name for validation error:", reportEntry);
                    return;
                }

                let displayMessage = reportEntry.message;
                if (reportEntry.details) {
                    displayMessage += ` (${reportEntry.details})`;
                }

                let errorDisplayElement = activeFormElement.find(`#${targetFieldName}-validation-msg`);

                // If error display element doesn't exist, create it next to the input
                if (errorDisplayElement.length === 0) {
                    const associatedInput = activeFormElement.find(`*[name='${targetFieldName}']`);
                    if (associatedInput.length > 0) {
                        // Insert a new span element after the input for error display
                        associatedInput.after(`<span id='${targetFieldName}-validation-msg' class='field-validation-error'></span>`);
                        errorDisplayElement = activeFormElement.find(`#${targetFieldName}-validation-msg`);
                    } else {
                        console.warn(`SchemaFormRenderer: Input field '${targetFieldName}' not found for error display.`);
                        return;
                    }
                }

                // Apply error class, set message, and show
                errorDisplayElement.addClass("is-invalid").html(displayMessage).show();
            });
        };

        /**
         * @deprecated Use `displayValidationFeedback` instead.
         * Processes a full validation report object.
         * @param {object} report - The validation report object, expected to have an `errors` array.
         */
        instanceContext.processValidationSummary = function(report) {
            console.warn("SchemaFormRenderer.processValidationSummary is deprecated. Use .displayValidationFeedback instead.");
            if (report && report.errors) {
                instanceContext.displayValidationFeedback(report.errors);
            }
        };

        /**
         * Retrieves the data type for a given field from the schema.
         * @param {string} fieldName - The name of the field.
         * @returns {string|undefined} The schema type (e.g., "string", "integer", "boolean") or undefined if not found.
         */
        function getFieldSchemaType(fieldName) {
            const properties = componentConfig.schema && componentConfig.schema.properties;
            if (properties && properties[fieldName] && properties[fieldName].type) {
                return properties[fieldName].type;
            }
            return undefined; // Explicitly return undefined if type is not found
        }

        /**
         * Populates form input fields with values from the current schema payload.
         * This function is typically used during initialization or when the payload changes externally.
         * @param {string} key - The name of the property/field.
         * @param {*} val - The value to set for the field.
         */
        function syncFormToData(key, val) {
            const targetInputElements = activeFormElement.find(`*[name='${key}']`);

            if (targetInputElements.length === 0) {
                // If no input element is found, it might be a schema property
                // that doesn't map directly to a form field (e.g., a container object).
                // Or simply an unrendered field.
                return;
            }

            const inputTypeAttribute = targetInputElements.attr("type");
            const schemaDefinedType = getFieldSchemaType(key);

            if (inputTypeAttribute === "checkbox" || inputTypeAttribute === "radio") {
                targetInputElements.each(function(_, currentInput) {
                    let isChecked = false;
                    if (schemaDefinedType === "array") {
                        // For array types, check if the input's value exists in the array
                        isChecked = Array.isArray(val) && val.includes(currentInput.value);
                    } else {
                        // For boolean types, check if the value is strictly true
                        isChecked = (val === true);
                    }
                    jq(currentInput).prop("checked", isChecked); // Use .prop for checked status
                });
            } else if (targetInputElements.is("select") && schemaDefinedType === "array") {
                // Handle multi-selects for array types
                targetInputElements.val(Array.isArray(val) ? val : []);
            } else {
                // For other input types (text, number, date, etc.), just set the value
                targetInputElements.val(val);
            }
        }

        /**
         * Updates the internal schema payload based on changes in form input fields.
         * Also triggers validation and updates the output textarea.
         * @param {string} inputKind - The type of input element (e.g., "text", "checkbox", "select").
         * @param {string} fieldName - The 'name' attribute of the input element.
         * @param {*} fieldValue - The new value from the input element.
         * @param {boolean} isChecked - For checkboxes/radios, indicates if it's checked.
         */
        function syncDataToForm(inputKind, fieldName, fieldValue, isChecked) {
            // Guard against fields not defined in the schema's properties
            if (!componentConfig.schema || !componentConfig.schema.properties || !componentConfig.schema.properties[fieldName]) {
                // This field is not directly mapped in the schema, ignore its changes.
                return;
            }

            const fieldSchemaType = getFieldSchemaType(fieldName);

            if (fieldSchemaType === "boolean") {
                currentSchemaPayload[fieldName] = isChecked;
            } else if (fieldSchemaType === "integer") {
                currentSchemaPayload[fieldName] = Number.parseInt(fieldValue, 10) || 0; // Default to 0 on parse failure
            } else if (fieldSchemaType === "number") {
                currentSchemaPayload[fieldName] = Number.parseFloat(fieldValue) || 0.0; // Default to 0.0 on parse failure
            } else if (fieldSchemaType === "array") {
                if (inputKind === "text") {
                    // For text inputs that represent arrays (e.g., comma-separated tags)
                    currentSchemaPayload[fieldName] = fieldValue ? fieldValue.split(arrayInputSplitter).filter(s => s.trim() !== '') : [];
                } else {
                    // For checkboxes/multi-selects representing arrays
                    currentSchemaPayload[fieldName] = currentSchemaPayload[fieldName] || [];
                    const currentArray = currentSchemaPayload[fieldName];
                    const itemIndex = currentArray.indexOf(fieldValue);
                    const itemExists = itemIndex !== -1;

                    if (isChecked && !itemExists) {
                        currentArray.push(fieldValue);
                    } else if (!isChecked && itemExists) {
                        // Remove item using jQuery.grep for immutability and cleaner array manipulation
                        currentSchemaPayload[fieldName] = jq.grep(currentArray, function(value, i) {
                            return i !== itemIndex;
                        });
                    }
                }
            } else {
                // Default handling for string and other types
                currentSchemaPayload[fieldName] = fieldValue;
            }

            // Trigger client-side validation if a validator is available
            if (dataValidator) {
                // Small debounce for validation to avoid excessive calls on rapid input
                if (instanceContext._validationTimeout) {
                    clearTimeout(instanceContext._validationTimeout);
                }
                instanceContext._validationTimeout = setTimeout(() => {
                    const validationResult = dataValidator.validate(currentSchemaPayload, componentConfig.schema);
                    instanceContext.displayValidationFeedback(validationResult.errors);
                }, 150); // 150ms debounce
            }

            // Update the JSON output area
            jsonOutputArea.val(JSON.stringify(currentSchemaPayload, null, 2));
        }

        // --- Initialization ---
        // Populate the form with initial data from the parsed JSON
        jq.each(currentSchemaPayload, syncFormToData);

        // --- Event Binding ---
        // Use delegated event handling for 'change' events on form elements
        activeFormElement.on('change', 'input, select, textarea', function(event) {
            const changedElement = jq(event.target);
            const elementTagName = changedElement.prop('tagName').toLowerCase();
            let inputType;

            // Determine the effective input type
            if (elementTagName === "select") {
                inputType = "select";
            } else {
                inputType = changedElement.attr("type") || "text"; // Default to 'text' if type attribute is missing
            }

            const elementName = changedElement.attr('name');
            const elementValue = changedElement.val();
            // Use .prop('checked') for reliable checkbox/radio state
            const elementIsChecked = changedElement.prop("checked");

            // Only proceed if the element has a 'name' attribute, which is used to map to schema properties
            if (elementName) {
                syncDataToForm(inputType, elementName, elementValue, elementIsChecked);
            }
        });

        // Add a public destroy method for cleanup
        instanceContext.destroy = function() {
            activeFormElement.off('change', 'input, select, textarea');
            activeFormElement.removeClass("has-validation-errors");
            jq('.field-validation-error', activeFormElement).remove(); // Remove error message elements
            // If the form was dynamically generated, remove it
            if (!componentConfig.existingFormSelector) {
                activeFormElement.remove();
            }
            if (instanceContext._validationTimeout) {
                clearTimeout(instanceContext._validationTimeout);
            }
            console.log("SchemaFormRenderer instance destroyed.");
        };
    }

    // --- Prototype Template Definition ---
    // This template uses jQuery.tmpl syntax.
    SchemaFormRenderer.prototype.DEFAULT_MARKUP_TEMPLATE = [
        '<div class="schema-form-container">',
        '  <h2>${name || "Schema Form"}</h2>', // Display form title from schema or a default
        '  <p class="form-description">${description || ""}</p>', // Optional form description
        '  {{each(propName, propDetails) properties}}', // Iterate over schema properties
        '    <div class="form-group">',
        '      <label for="${propName}">',
        '        {{if propDetails.description}}', // Use description as label if available
        '          <strong>${propDetails.description}</strong>',
        '        {{else}}',
        '          <strong>${propName}</strong>', // Fallback to property name
        '        {{/if}}',
        '        {{if propDetails.required === true}}',
        '          <span class="required-indicator" aria-label="Required field">*</span>',
        '        {{else if propDetails.required === false}}',
        '          <span class="optional-indicator">(optional)</span>',
        '        {{/if}}',
        '      </label>',
        '      {{if propDetails.type === "time" || propDetails.type === "date"}}',
        '        <input id="${propName}" name="${propName}" list="${propName}_datalist" type="${propDetails.type}" class="form-control"/>',
        '      {{else propDetails.type === "date-time"}}', // Special handling for 'date-time'
        '        <input id="${propName}" name="${propName}" list="${propName}_datalist" type="datetime-local" class="form-control"/>', // HTML5 type
        '      {{else propDetails.type === "integer" || propDetails.type === "number"}}',
        '        <input id="${propName}" name="${propName}" list="${propName}_datalist" type="number" class="form-control" step="{{if propDetails.type === "integer"}}1{{else}}any{{/if}}"/>',
        '      {{else propDetails.type === "boolean"}}',
        '        <input id="${propName}" name="${propName}" type="checkbox" class="form-check-input"/>',
        '      {{else propDetails.type === "array" && propDetails.items && propDetails.items.enum}}', // Multi-select for array with enum items
        '        <select id="${propName}" name="${propName}" multiple="multiple" class="form-control form-multiselect">',
        '          {{each(itemIndex, enumValue) propDetails.items.enum}}',
        '            <option value="${enumValue}">${enumValue}</option>',
        '          {{/each}}',
        '        </select>',
        '      {{else propDetails.type === "array" && propDetails.items && (propDetails.items.type === "string" || !propDetails.items.type)}}', // Text input for generic array of strings
        '        <input id="${propName}" name="${propName}" type="text" class="form-control form-tag-input" placeholder="Comma-separated values"/>',
        '      {{else propDetails.type === "string"}}', // Basic string input
        '        {{if propDetails.enum}}', // Dropdown for string with enum
        '          <select id="${propName}" name="${propName}" class="form-control">',
        '            {{each(itemIndex, enumValue) propDetails.enum}}',
        '              <option value="${enumValue}">${enumValue}</option>',
        '            {{/each}}',
        '          </select>',
        '        {{else if propDetails.format === "textarea"}}', // Textarea for multiline string
        '          <textarea id="${propName}" name="${propName}" class="form-control" rows="3"></textarea>',
        '        {{else}}', // Default text input for string
        '          <input id="${propName}" name="${propName}" list="${propName}_datalist" type="text" class="form-control"/>',
        '        {{/if}}',
        '      {{else}}', // Fallback for unknown types (e.g., object, null, other array types)
        '        <div class="alert alert-warning">Unsupported field type: ${propDetails.type || "unknown"} for ${propName}</div>',
        '      {{/if}}',
        '      <span id="${propName}-validation-msg" class="field-validation-error" style="display:none;"></span>',
        '    </div>',
        '  {{/each}}',
        '  {{each(propName, propDetails) properties}}',
        '    <datalist id="${propName}_datalist"></datalist>', // Datalist containers for auto-suggest
        '  {{/each}}',
        '</div>'
    ].join('\n');

    return SchemaFormRenderer;

}));