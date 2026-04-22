const UtilityKit = {};

// --- Core DOM & Event Utilities ---
// Replaces jQuery's $('selector', context)
UtilityKit.findInContext = (selector, contextElement) => {
    return (contextElement || document).querySelector(selector);
};

// Replaces jQuery's $('selector')
UtilityKit.findAll = (selector, contextElement) => {
    return Array.from((contextElement || document).querySelectorAll(selector));
};

// Replaces jQuery's .each()
UtilityKit.iterateElements = (elementsList, processorFunction) => {
    elementsList.forEach((elementItem, elementIndex) => processorFunction.call(elementItem, elementIndex, elementItem));
};

// Replaces jQuery's .val() or .is(':checked')
UtilityKit.retrieveElementValue = (targetElement) => {
    if (!targetElement) return '';
    if (targetElement.type === 'checkbox' || targetElement.type === 'radio') {
        return targetElement.checked;
    }
    return targetElement.value;
};

// Replaces _.bind
UtilityKit.createBoundInvocation = (targetFunction, contextObject, ...initialArguments) => {
    return targetFunction.bind(contextObject, ...initialArguments);
};

// Simple debounce function, replaces _.debounce
UtilityKit.delayExecution = (actionToPerform, waitDuration) => {
    let timerHandle;
    return function(...args) {
        const executionContext = this;
        clearTimeout(timerHandle);
        timerHandle = setTimeout(() => actionToPerform.apply(executionContext, args), waitDuration);
    };
};

// Replaces controlFor and valueFrom
UtilityKit.locateInputByDataAlias = (parentContainer, aliasString) => {
    return UtilityKit.findInContext(`[data-alias="${aliasString}"]`, parentContainer);
};

UtilityKit.getValueByDataAlias = (parentContainer, aliasString) => {
    const identifiedElement = UtilityKit.locateInputByDataAlias(parentContainer, aliasString);
    return UtilityKit.retrieveElementValue(identifiedElement);
};

// Store CodeMirror instances, replacing jQuery's .data('editor')
const editorInstanceRegistry = new WeakMap();
UtilityKit.storeEditorInstance = (textareaElement, editorObject) => {
    editorInstanceRegistry.set(textareaElement, editorObject);
};
UtilityKit.getStoredEditor = (textareaElement) => {
    return editorInstanceRegistry.get(textareaElement);
};

// Executes a callback when the DOM is fully loaded
UtilityKit.runWhenDOMReady = (callbackFunction) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callbackFunction);
    } else {
        callbackFunction();
    }
};

// --- Module 1: Schema Filtering ---
const SchemaDisplayFilter = (() => {
    const visibilityToggleClass = 'hidden-item-style'; // CSS class for hiding

    // Replaces 'toggle'
    const adjustRowVisibility = (comparisonText, rowIndex, rowDomElement) => {
        const rowContent = rowDomElement.textContent || rowDomElement.innerText;
        if (rowContent.includes(comparisonText)) {
            rowDomElement.classList.remove(visibilityToggleClass);
        } else {
            rowDomElement.classList.add(visibilityToggleClass);
        }
    };

    // Replaces 'update'
    const executeFilterApplication = function() { // 'this' will be the input element
        const currentFilterTerm = UtilityKit.retrieveElementValue(this);
        const allSchemaRows = UtilityKit.findAll('.schema-data-table tbody tr');
        
        allSchemaRows.forEach(row => {
            adjustRowVisibility(currentFilterTerm, 0, row); // row index not critical here
        });
    };

    // Replaces 'init'
    const initializeFilterWidget = function() { // 'this' will be the .schema-filter-area element
        const filterInputBox = document.createElement('input');
        filterInputBox.setAttribute('type', 'text');
        filterInputBox.setAttribute('placeholder', 'Refine schema entries');
        filterInputBox.classList.add('schema-search-input'); 
        this.appendChild(filterInputBox);

        filterInputBox.addEventListener('keyup', executeFilterApplication);
    };

    // Activation on DOM ready
    UtilityKit.runWhenDOMReady(() => {
        UtilityKit.iterateElements(UtilityKit.findAll('.schema-filter-area'), initializeFilterWidget);
    });

    return {}; 
})();

// --- Module 2: Schema Update Controls ---
const SchemaDefinitionGenerator = (() => {

    // Replaces 'booleanFrom'
    const retrieveCheckboxState = (contextNode, aliasIdentifier) => {
        const inputElement = UtilityKit.locateInputByDataAlias(contextNode, aliasIdentifier);
        return inputElement ? inputElement.checked : false;
    };

    // Replaces 'uniqueVal'
    const composeUniqueFragment = (uniqueAttributeValue) => {
        return uniqueAttributeValue ? `   :db/unique :db.unique/${uniqueAttributeValue}\n` : '';
    };

    // Replaces 'update'
    const produceEdnOutput = function() { // 'this' is the container element
        const currentPanel = this;
        
        const fetchCurrentValue = UtilityKit.createBoundInvocation(UtilityKit.getValueByDataAlias, null, currentPanel);
        const fetchCurrentBoolean = UtilityKit.createBoundInvocation(retrieveCheckboxState, null, currentPanel);

        const targetTextarea = UtilityKit.findInContext('textarea', currentPanel);
        const codeMirrorInstance = targetTextarea ? UtilityKit.getStoredEditor(targetTextarea) : null;

        if (!codeMirrorInstance) {
            console.warn('Code editor not found for schema definition panel:', currentPanel);
            return;
        }

        const identifierAlias = fetchCurrentValue('entity-ident'); 
        const valueKindAlias = fetchCurrentValue('value-type-def');
        const cardinalityKindAlias = fetchCurrentValue('cardinality-def');
        const documentText = fetchCurrentValue('doc-text').replace(/"/g, '\\"');
        const uniqueConstraint = fetchCurrentValue('unique-opt');
        const isFulltextEnabled = fetchCurrentBoolean('fulltext-flag');
        const isHistoryDisabled = fetchCurrentBoolean('no-history-flag');

        const generatedEdnString = [
            '[{ :db/id #db/id[:db.part/db]\n',
            `   :db/ident ${identifierAlias}\n`,
            `   :db/valueType :db.type/${valueKindAlias}\n`,
            `   :db/cardinality :db.cardinality/${cardinalityKindAlias}\n`,
            `   :db/doc "${documentText}"\n`,
            composeUniqueFragment(uniqueConstraint),
            `   :db/fulltext ${isFulltextEnabled}\n`,
            `   :db/noHistory ${isHistoryDisabled}\n`,
            '   :db.install/_attribute :db.part/db }]'
        ].join('');

        codeMirrorInstance.setValue(generatedEdnString);
        codeMirrorInstance.markText(
            {line:0, ch:0},
            {line:100, ch:100}, // Effectively covers the whole document
            {readOnly: true}
        );
    };

    // Replaces 'init'
    const setupDefinitionControls = function() { // 'this' is the container element
        const currentPanel = this;
        const delayedEdnUpdate = UtilityKit.delayExecution(
            UtilityKit.createBoundInvocation(produceEdnOutput, currentPanel),
            500
        );

        const dataEntryElementsSelector = '.data-attribute-group input, .data-attribute-group select'; 
        const allRelevantControls = UtilityKit.findAll(dataEntryElementsSelector, currentPanel);

        allRelevantControls.forEach(controlNode => {
            if (controlNode.tagName === 'SELECT') {
                controlNode.addEventListener('change', delayedEdnUpdate);
            } else if (controlNode.type === 'text') {
                controlNode.addEventListener('keyup', delayedEdnUpdate);
            } else if (controlNode.type === 'checkbox') {
                controlNode.addEventListener('click', delayedEdnUpdate);
            }
        });

        // Trigger initial update after a brief moment
        setTimeout(delayedEdnUpdate, 100);
    };

    // Activation on DOM ready
    UtilityKit.runWhenDOMReady(() => {
        UtilityKit.iterateElements(UtilityKit.findAll('.schema-definition-panel'), setupDefinitionControls);
    });

    return {};
})();

// --- Module 3: Data Inserting ---
const DataEntryForm = (() => {

    // Replaces 'remove'
    const removeDomElement = (targetNode) => {
        targetNode.remove();
    };

    // Replaces 'initRow'
    const attachRowRemovalHandler = function() { // 'this' is the row element
        const currentEntryRow = this;
        const deleteActionLink = document.createElement('a');
        deleteActionLink.textContent = 'remove entry';
        deleteActionLink.classList.add('delete-item-action');
        deleteActionLink.addEventListener('click', UtilityKit.createBoundInvocation(removeDomElement, null, currentEntryRow));
        currentEntryRow.appendChild(deleteActionLink);
    };

    // Replaces 'toNameValue'
    const extractKeyPairFromElement = (entryRowDom) => {
        const keyInput = UtilityKit.locateInputByDataAlias(entryRowDom, 'attribute-key');
        const valueInput = UtilityKit.locateInputByDataAlias(entryRowDom, 'attribute-value');
        return {
            keyProp: UtilityKit.retrieveElementValue(keyInput),
            valueProp: UtilityKit.retrieveElementValue(valueInput)
        };
    };

    // Replaces 'toEdn'
    const accumulateEdnEntries = (currentString, entryObject) => {
        return `${currentString}\n   ${entryObject.keyProp} ${entryObject.valueProp}`;
    };

    // Replaces 'update'
    const updateGeneratedEdn = function() { // 'this' is the container
        const currentDataContainer = this;
        const editorTextarea = UtilityKit.findInContext('textarea', currentDataContainer);
        const editorInstance = editorTextarea ? UtilityKit.getStoredEditor(editorTextarea) : null;

        if (!editorInstance) {
            console.warn('Code editor not found for data entry form:', currentDataContainer);
            return;
        }

        const allEntryRows = UtilityKit.findAll('.data-attribute-row', currentDataContainer); 
        const processedEntries = allEntryRows.map(extractKeyPairFromElement);
        const combinedEdnContent = processedEntries.reduce(accumulateEdnEntries, '');

        // Remove the initial '\n   ' (4 characters) from the accumulated string
        const finalEdnStructure = `[{ ${combinedEdnContent.substring(4)} }]`;
        
        editorInstance.setValue(finalEdnStructure);
    };

    // Replaces 'make'
    const constructInputWrapper = (fieldIdentifierAlias) => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add(`input-field-group-${fieldIdentifierAlias}`); 
        const inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('data-alias', `attribute-${fieldIdentifierAlias}`); 
        wrapperDiv.appendChild(inputElement);
        return wrapperDiv;
    };

    // Replaces select2 related functions (toResult, results, query, select2Changed)
    // The AJAX call for schema options is simulated, but the UI integration of a select2 widget is omitted.
    // The 'attribute-key' input will be a standard text input.
    const fetchSchemaAttributeSuggestions = async (searchTerm) => {
        try {
            const response = await fetch(`/session/schema.json?query=${encodeURIComponent(searchTerm || '')}`);
            if (!response.ok) throw new Error('Network response was not successful.');
            const responseData = await response.json();
            // In a production app, this data would populate a custom autocomplete UI.
            // For this Type IV clone, we confirm the data fetching, but not the complex UI widget.
            console.info('Schema suggestions fetched (UI integration skipped):', responseData);
            return responseData.map(item => ({ val: `:${item['db/ident']}`, label: `:${item['db/ident']}` }));
        } catch (error) {
            console.error('Error fetching schema attribute suggestions:', error);
            return [];
        }
    };

    // Replaces 'add'
    const appendNewAttributeRow = async (parentContainerNode) => {
        const entryFieldsContainer = UtilityKit.findInContext('.attribute-entry-list', parentContainerNode); 
        const delayedUpdateAction = UtilityKit.delayExecution(
            UtilityKit.createBoundInvocation(updateGeneratedEdn, parentContainerNode),
            500
        );

        const keyInputGroup = constructInputWrapper('key');
        const valueInputGroup = constructInputWrapper('value');

        const newAttributeRow = document.createElement('div');
        newAttributeRow.classList.add('data-attribute-row');
        newAttributeRow.appendChild(keyInputGroup);
        newAttributeRow.appendChild(valueInputGroup);
        entryFieldsContainer.appendChild(newAttributeRow);

        // The 'key' input was originally a select2. Now it's a text input.
        const keyTextInput = UtilityKit.locateInputByDataAlias(keyInputGroup, 'attribute-key');
        keyTextInput.setAttribute('placeholder', 'Enter attribute name...');
        // We could attach an autocomplete here if desired, but for Type IV,
        // just having a text input that captures the value is sufficient.
        // The AJAX call to fetch suggestions exists but is not bound to UI.

        const valueTextInput = UtilityKit.locateInputByDataAlias(valueInputGroup, 'attribute-value');
        valueTextInput.addEventListener('keyup', delayedUpdateAction);

        // Attach delete functionality to the new row
        UtilityKit.createBoundInvocation(attachRowRemovalHandler, newAttributeRow)(); 

        // Trigger an immediate update for the new row's effect
        delayedUpdateAction();
    };

    // Replaces 'init'
    const initializeDataInsertionModule = function() { // 'this' is the container
        const currentDataContainer = this;
        const entryPointList = UtilityKit.findInContext('.attribute-entry-list', currentDataContainer);
        
        const addEntryButton = document.createElement('a');
        addEntryButton.classList.add('add-entry-button', 'control-button', 'accent-button'); 
        addEntryButton.textContent = 'Add New Attribute';
        addEntryButton.addEventListener('click', UtilityKit.createBoundInvocation(appendNewAttributeRow, null, currentDataContainer));
        
        // Insert the button after the list of fields
        entryPointList.parentNode.insertBefore(addEntryButton, entryPointList.nextSibling);

        // Initial EDN generation
        UtilityKit.createBoundInvocation(updateGeneratedEdn, currentDataContainer)();
    };

    // Activation on DOM ready
    UtilityKit.runWhenDOMReady(() => {
        UtilityKit.iterateElements(UtilityKit.findAll('.data-input-form'), initializeDataInsertionModule);
    });

    return {};
})();

// --- Module 4: CodeMirror Initialization ---
const CodeMirrorSetup = (() => {

    // Replaces 'initCodeElement'
    const setupCodeMirrorEditor = function() { // 'this' is the textarea
        const configuration = {
            mode: "clojure",
            lineNumbers: true,
            matchBrackets: true
        };
        const editorInstance = CodeMirror.fromTextArea(this, configuration);
        UtilityKit.storeEditorInstance(this, editorInstance); // Store for later retrieval
    };

    // Activation on DOM ready
    UtilityKit.runWhenDOMReady(() => {
        UtilityKit.iterateElements(UtilityKit.findAll('textarea.code-area-target'), setupCodeMirrorEditor); // Targeted class
    });

    return {};
})();

// --- Module 5: Disconnect Confirmation ---
const SessionLogoutConfirmation = (() => {
    const triggerConfirmationPrompt = () => {
        return window.confirm('Are you absolutely sure you wish to proceed?');
    };

    // Activation on DOM ready
    UtilityKit.runWhenDOMReady(() => {
        UtilityKit.iterateElements(UtilityKit.findAll('.session-terminate-link'), (idx, linkElement) => { 
            linkElement.addEventListener('click', (eventObject) => {
                if (!triggerConfirmationPrompt()) {
                    eventObject.preventDefault(); // Prevent navigation if user cancels
                }
            });
        });
    });

    return {};
})();