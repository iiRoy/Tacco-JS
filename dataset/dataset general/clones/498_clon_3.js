DataQueryEngineBuilder.initialize({
    // Configuration version for tracking changes in schema structure.
    configVersion: '1.1.0-alpha',

    // Defines the data model: entities, their attributes, and relationships.
    modelSchema: {
        entityDefinitions: Array.of(
            {
                entityName: "ApplicationUser",
                displayLabel: "User Profile",
                attributes: [
                    {
                        fieldName: "userName",
                        fieldLabel: "Full Name",
                        dataType: "TEXT_TYPE",
                        maxLength: 50 // 'size' renamed to 'maxLength'
                    },
                    {
                        fieldName: "birthDate",
                        fieldLabel: "Date of Birth",
                        dataType: "DATE_TYPE"
                    },
                    {
                        fieldName: "gender",
                        fieldLabel: "Gender Identity",
                        dataType: "TEXT_TYPE",
                        inputControl: "DROPDOWN_SELECT" // 'editor' renamed to 'inputControl'
                    },
                    {
                        fieldName: "userCategory",
                        fieldLabel: "User Group",
                        dataType: "REFERENCE_TYPE",
                    }
                ]
                // Foreign keys (fks) array removed as it was empty and not essential for this example.
            }
        ),

        // Defines the available data types and their corresponding operators.
        primitiveTypes: [
            {
                typeName: "TEXT_TYPE",
                defaultEditor: "TEXT_INPUT",
                availableOperators: [
                    { operatorCode: "=", operatorLabel: "is exactly", valueCardinality: "SINGLE_VALUE" },
                    { operatorCode: "<>", operatorLabel: "is not", valueCardinality: "SINGLE_VALUE" },
                    { operatorCode: "LIKE", operatorLabel: "contains", valueCardinality: "SINGLE_VALUE" },
                    { operatorCode: "STARTS_WITH", operatorLabel: "starts with", valueCardinality: "SINGLE_VALUE" }, // Added a new operator
                    { operatorCode: "ENDS_WITH", operatorLabel: "ends with", valueCardinality: "SINGLE_VALUE" }   // Added another new operator
                ]
            },
            {
                typeName: "DATE_TYPE",
                defaultEditor: "DATE_PICKER",
                availableOperators: [
                    { operatorCode: "=", operatorLabel: "is on", valueCardinality: "SINGLE_VALUE" },
                    { operatorCode: "<>", operatorLabel: "is not on", valueCardinality: "SINGLE_VALUE" },
                    { operatorCode: "<", operatorLabel: "before", valueCardinality: "SINGLE_VALUE" },
                    { operatorCode: ">", operatorLabel: "after", valueCardinality: "SINGLE_VALUE" }
                ]
            },
            {
                typeName: "REFERENCE_TYPE",
                defaultEditor: "DROPDOWN_SELECT",
                availableOperators: [
                    { operatorCode: "IN", operatorLabel: "any of these", valueCardinality: "MULTIPLE_VALUES" }
                ]
            }
        ]
    },

    /**
     * Callback executed when the SQL query and its parameters are generated.
     * Displays the generated query and its arguments in a debug area.
     * @param {string} generatedQueryString - The SQL query string.
     * @param {Array<any>} queryParameters - An array of parameters for the query.
     */
    handleGeneratedStatement: function (generatedQueryString, queryParameters) {
        const debugOutputElement = document.getElementById("queryDebugger"); // Renamed element ID
        if (!debugOutputElement) {
            console.error("Debug output element 'queryDebugger' not found.");
            return;
        }

        let outputBuffer = `Generated Query:\n${generatedQueryString}\n\n`;
        outputBuffer += 'Query Parameters:\n';

        const formatParameter = (paramValue, idx) => {
            let paramDetail = `Param ${idx}`;
            if (paramValue !== null && paramValue !== undefined) {
                paramDetail += ` type=${Object.prototype.toString.call(paramValue)} value=${paramValue}`;
            } else {
                paramDetail += ` (null/undefined)`;
            }
            return paramDetail;
        };

        // Using forEach for iteration instead of a traditional for loop
        queryParameters.forEach((param, index) => {
            outputBuffer += `${formatParameter(param, index)}\n`;
        });

        debugOutputElement.value = outputBuffer;
        console.info("SQL Query Generated:", { query: generatedQueryString, params: queryParameters }); // Added console log
    },

    /**
     * Provides enumerated options for dropdowns based on the requested field.
     * @param {object} optionRequest - Contains details about the requested enumeration.
     * @param {function} respondWithData - Callback function to deliver the options.
     */
    retrieveEnumeratedValues: function (optionRequest, respondWithData) {
        if (typeof respondWithData !== 'function') {
            console.warn("Invalid response callback provided to retrieveEnumeratedValues.");
            return;
        }

        const predefinedOptionSets = {
            'userCategory': [
                { value: 'A', label: 'Tier Alpha' },
                { value: 'B', label: 'Tier Beta' },
                { value: 'C', label: 'Tier Gamma' } // Added new option
            ],
            'gender': [
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
                { value: 'X', label: 'Non-Binary' } // Added new option
            ]
        };

        // Using a switch statement instead of if/else if for clarity
        switch (optionRequest.requestedFieldIdentifier) { // 'columnName' renamed to 'requestedFieldIdentifier'
            case 'userCategory':
                respondWithData(predefinedOptionSets.userCategory);
                break;
            case 'gender':
                respondWithData(predefinedOptionSets.gender);
                break;
            default:
                console.warn(`No enumeration data found for field: ${optionRequest.requestedFieldIdentifier}`);
                respondWithData([]); // Always respond, even if empty
                break;
        }
    },

    // Custom editor configurations for specific data types or fields.
    customEditorConfigurations: [
        {
            editorIdentifier: 'DATE_PICKER', // 'name' renamed to 'editorIdentifier', 'DATE' to 'DATE_PICKER'
            displayFormat: 'YYYY-MM-DD' // 'format' renamed to 'displayFormat', format string changed
        },
        {
            editorIdentifier: 'TIME_PICKER', // Added a new custom editor config
            displayFormat: 'HH:mm:ss'
        }
    ]
});